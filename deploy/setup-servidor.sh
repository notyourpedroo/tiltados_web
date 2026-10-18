#!/usr/bin/env bash
# Prepara o servidor para o deploy automático do tiltados_web (rodar UMA vez, como root).
#
#   bash setup-servidor.sh "ssh-ed25519 AAAA... github-actions-tiltados-web"
#
# O que faz:
# - cria o usuário de sistema "deploy", que só aceita a chave pública informada;
# - cria /opt/tiltados_web (releases/ + link "current" para a versão no ar);
# - instala o serviço tiltados-web.service (node server.js, como "deploy", sem root);
# - permite ao "deploy" apenas reiniciar/parar esse serviço e desligar o antigo
#   tiltados-app.service na primeira publicação.
#
# Não mexe no site atual: tiltados-app.service e /opt/tiltados_app continuam no ar
# até a primeira publicação bem-sucedida pelo GitHub Actions.
set -euo pipefail

if [[ $EUID -ne 0 ]]; then
  echo "Rode como root." >&2
  exit 1
fi
if [[ $# -ne 1 || "$1" != ssh-* ]]; then
  echo "Uso: bash $0 \"<chave publica ssh do deploy>\"" >&2
  exit 1
fi
PUBKEY="$1"

APP_USER=deploy
BASE=/opt/tiltados_web
SERVICE=tiltados-web
NODE_BIN="$(command -v node)"
SYSTEMCTL="$(command -v systemctl)"

# 1. Usuário de deploy (sem senha; entra só por chave).
if ! id "$APP_USER" &>/dev/null; then
  useradd --system --create-home --shell /bin/bash "$APP_USER"
fi
HOME_DIR="$(getent passwd "$APP_USER" | cut -d: -f6)"
install -d -m 700 -o "$APP_USER" -g "$APP_USER" "$HOME_DIR/.ssh"
AUTH="$HOME_DIR/.ssh/authorized_keys"
touch "$AUTH"
# "restrict" bloqueia encaminhamento de portas, agente e terminal interativo;
# comandos e cópia de arquivos (scp) continuam funcionando.
if ! grep -qF "$PUBKEY" "$AUTH"; then
  echo "restrict $PUBKEY" >>"$AUTH"
fi
chown "$APP_USER:$APP_USER" "$AUTH"
chmod 600 "$AUTH"

# 2. Pastas das versões publicadas.
install -d -o "$APP_USER" -g "$APP_USER" "$BASE" "$BASE/releases"

# 3. Serviço do site (standalone do Next: node server.js).
cat >/etc/systemd/system/$SERVICE.service <<EOF
[Unit]
Description=Tiltados Web (Next.js)
After=network.target tiltados-api.service
Wants=tiltados-api.service
# Só sobe depois que a primeira versão tiver sido publicada.
ConditionPathExists=$BASE/current/server.js

[Service]
User=$APP_USER
WorkingDirectory=$BASE/current
Environment=NODE_ENV=production
Environment=NEXT_TELEMETRY_DISABLED=1
Environment=HOSTNAME=127.0.0.1
Environment=PORT=3000
Environment=TILTADOS_API_URL=http://127.0.0.1:8000
ExecStart=$NODE_BIN server.js
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

# 4. Permissões mínimas do "deploy" (apenas estes comandos, sem senha).
SUDOERS=/etc/sudoers.d/$SERVICE
cat >"$SUDOERS.tmp" <<EOF
$APP_USER ALL=(root) NOPASSWD: $SYSTEMCTL restart $SERVICE, $SYSTEMCTL stop $SERVICE, $SYSTEMCTL disable --now tiltados-app, $SYSTEMCTL enable --now tiltados-app
EOF
chmod 440 "$SUDOERS.tmp"
visudo -cf "$SUDOERS.tmp" >/dev/null
mv "$SUDOERS.tmp" "$SUDOERS"

systemctl daemon-reload
systemctl enable "$SERVICE" >/dev/null

echo "Pronto. Usuário '$APP_USER', pasta $BASE e serviço $SERVICE preparados."
echo "O site atual segue no ar; a primeira publicação pelo GitHub Actions faz a troca."
