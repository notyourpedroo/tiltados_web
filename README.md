# Tiltados F1 — site

Site de resultados da liga Tiltados de F1 virtual, no estilo das páginas de resultados da F1.
Consome a [Tiltados API](https://github.com/notyourpedroo/tiltados_api).

Feito com Next.js 16 (App Router, Cache Components), TypeScript e Tailwind CSS 4.

## Páginas

| Rota | Conteúdo |
|---|---|
| `/{temporada}` | Visão geral: líder/campeão, última corrida, destaques e evolução do campeonato |
| `/{temporada}/corridas` | Todas as etapas com vencedor, pole, volta mais rápida e sprint |
| `/{temporada}/corridas/{race_id}` | Classificação completa da sessão, pódio, posições ganhas e punições |
| `/{temporada}/pilotos` | Classificação de pilotos e gráfico de pontos acumulados |
| `/{temporada}/pilotos/{driver_id}` | Perfil do piloto: estatísticas, resumo da temporada, duelo com companheiro e resultados |
| `/{temporada}/equipes` | Campeonato de construtores e contribuição de cada piloto |
| `/2026/superlicenca` | Saldo da Superlicença e punições registradas |

`/` redireciona para `/2026`.

## Rodando

```bash
npm install
npm run dev
```

Abra http://localhost:3000.

A URL da API pode ser trocada pela variável `TILTADOS_API_URL` (veja `.env.example`).

## Como os dados são buscados

- A API é chamada **só pelo servidor do Next** (`src/lib/api.ts`), nunca pelo navegador.
  Como ela é servida em HTTP, isso permite hospedar o site em HTTPS (Vercel etc.) sem bloqueio de
  *mixed content*.
- As respostas ficam em cache com `"use cache"` + `cacheLife("minutes")`: um CSV novo publicado na API
  aparece no site em cerca de um minuto, sem precisar de novo deploy.
- Pontos por sessão, voltas mais rápidas, rodadas e a evolução do campeonato são derivados em
  `src/lib/season.ts`, usando a mesma tabela de pontuação de `files/{season}/scores.csv` da API.
  As classificações (pilotos e construtores) vêm prontas da API.
- O build (`npm run build`) pré-renderiza todas as páginas conhecidas, então a API precisa estar no ar
  durante o build.

## Deploy automático

Cada push na `main` dispara o workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml):

1. **Verificar e empacotar** (no GitHub): `npm ci`, lint e `next build` com `output: "standalone"`.
   O resultado (`server.js` + só os arquivos necessários, ~6 MB) vira um pacote `release.tgz`.
   Pull requests param aqui, sem publicar.
2. **Publicar no servidor**: envia o pacote por SSH (usuário `deploy`) e roda
   [`deploy/publicar.sh`](deploy/publicar.sh), que extrai em `/opt/tiltados_web/releases/<data>-<commit>`,
   aponta o link `current` para a versão nova, reinicia o serviço `tiltados-web` e confere se o site
   responde. Se não responder, volta sozinho para a versão anterior. Ficam guardadas as 3 últimas versões.

O build é feito no GitHub porque o servidor tem 1 GB de RAM; lá só roda o `node server.js`.
Também dá para disparar uma publicação manual pela aba **Actions** (*Run workflow*).

**Preparação do servidor (uma vez):** [`deploy/setup-servidor.sh`](deploy/setup-servidor.sh), como root,
recebendo a chave pública do deploy. Cria o usuário `deploy`, a pasta `/opt/tiltados_web` e o serviço
`tiltados-web.service` (que lê a API em `http://127.0.0.1:8000`).

**Secrets do repositório** (Settings → Secrets and variables → Actions):

| Secret | Conteúdo |
|---|---|
| `DEPLOY_HOST` | IP do servidor |
| `DEPLOY_SSH_KEY` | Chave **privada** do usuário `deploy` |
| `DEPLOY_KNOWN_HOSTS` | Linha do `ssh-keyscan -t ed25519 <ip>` (identidade do servidor) |

**Voltar uma versão manualmente** (no servidor, como root):

```bash
ls -1t /opt/tiltados_web/releases
ln -sfn /opt/tiltados_web/releases/<versao> /opt/tiltados_web/current && systemctl restart tiltados-web
```

## Estrutura

```text
src/
├── app/[season]/          # rotas por temporada (visão geral, corridas, pilotos, equipes, superlicença)
├── components/            # cabeçalho, tabelas, gráficos de evolução e peças de UI
└── lib/
    ├── api.ts             # chamadas à Tiltados API (com cache)
    ├── season.ts          # modelo derivado da temporada
    ├── teams.ts           # cores e nomes curtos das equipes
    └── types.ts           # tipos das respostas da API
```

Ao adicionar uma equipe nova na liga, inclua a cor dela em `src/lib/teams.ts` e em `src/app/globals.css`
(equipes desconhecidas aparecem em cinza). As logos ficam em `public/teams/`: `{equipe}.webp` (colorida,
usada no tema claro) e `{equipe}-white.webp` (branca, usada no tema escuro), obtidas da CDN oficial da F1
(`media.formula1.com/.../common/f1/{ano}/{equipe}/{ano}{equipe}logo[white].webp`). A branca da Kick
Sauber vem da pasta de 2024, porque a de 2025 é igual à colorida. Equipes sem logo mostram a barrinha na
cor da equipe.
