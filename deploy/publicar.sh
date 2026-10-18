#!/usr/bin/env bash
# Publica uma versão do tiltados_web no servidor. Executado pelo GitHub Actions,
# via SSH, como o usuário "deploy":
#
#   ssh deploy@servidor 'bash -s -- /tmp/release.tgz 20261018-1530-abc1234' < deploy/publicar.sh
#
# Extrai o pacote em releases/<nome>, aponta "current" para ele, reinicia o serviço
# e confere se o site responde. Se não responder, volta para a versão anterior.
set -euo pipefail

TARBALL="$1"
NAME="$2"
BASE=/opt/tiltados_web
SERVICE=tiltados-web
OLD_SERVICE=tiltados-app
KEEP=3
HEALTH_URL=http://127.0.0.1:3000/2026
SYSTEMCTL="$(command -v systemctl)"

REL="$BASE/releases/$NAME"
PREV="$(readlink -f "$BASE/current" 2>/dev/null || true)"
MIGRATED=0

point_current_to() {
  ln -sfn "$1" "$BASE/current.tmp"
  mv -Tf "$BASE/current.tmp" "$BASE/current"
}

healthy() {
  for _ in $(seq 1 30); do
    if curl -fsS -o /dev/null --max-time 5 "$HEALTH_URL"; then
      return 0
    fi
    sleep 1
  done
  return 1
}

echo "==> Extraindo $NAME"
rm -rf "$REL"
mkdir -p "$REL"
tar -xzf "$TARBALL" -C "$REL"
rm -f "$TARBALL"

echo "==> Ativando $NAME"
point_current_to "$REL"

# Primeira publicação: desliga o serviço antigo, que ocupa a porta 3000.
if "$SYSTEMCTL" is-active --quiet "$OLD_SERVICE"; then
  echo "==> Desligando o serviço antigo ($OLD_SERVICE)"
  sudo "$SYSTEMCTL" disable --now "$OLD_SERVICE"
  MIGRATED=1
fi

sudo "$SYSTEMCTL" restart "$SERVICE"

echo "==> Conferindo $HEALTH_URL"
if healthy; then
  echo "==> No ar: $NAME"
else
  echo "!! O site não respondeu; desfazendo a publicação" >&2
  if [[ -n "$PREV" && -d "$PREV" ]]; then
    point_current_to "$PREV"
    sudo "$SYSTEMCTL" restart "$SERVICE"
  elif [[ $MIGRATED -eq 1 ]]; then
    sudo "$SYSTEMCTL" stop "$SERVICE"
    sudo "$SYSTEMCTL" enable --now "$OLD_SERVICE"
  fi
  rm -rf "$REL"
  exit 1
fi

# Mantém só as últimas versões (a no ar inclusive) para permitir voltar atrás.
ls -1dt "$BASE"/releases/*/ | tail -n +$((KEEP + 1)) | xargs -r rm -rf
