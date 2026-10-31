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
| `/{temporada}/equipes` | Campeonato de construtores, contribuição de cada piloto e evolução do campeonato de construtores |
| `/{temporada}/equipes/{team_id}` | Perfil da equipe: posição no campeonato de construtores, estatísticas da temporada e, em 2026, a Chance de título de construtores |
| `/2026/titulo` | Chance de título de pilotos e construtores, com o status e o Motivo de cada um |
| `/2026/superlicenca` | Saldo da Superlicença e punições registradas |

`/` redireciona para `/2026`.

## Rodando

O endereço da API não fica no repositório. Copie `.env.example` para `.env.local` (ignorado pelo Git)
e preencha `TILTADOS_API_URL` com o endereço real:

```bash
cp .env.example .env.local
npm install
npm run dev
```

Abra http://localhost:3000. O `npm install` também ativa o hook `commit-msg` de `.githooks/`.

Verificações (as duas primeiras rodam no CI junto com o build):

```bash
npm run lint       # ESLint, inclusive as regras de cor do design system
npm test           # Vitest
npm run typecheck  # gera os tipos de rota do Next e roda o tsc
```

### Rodando contra a API local

Quando a API de produção não responde da sua máquina, rode a [Tiltados API](https://github.com/notyourpedroo/tiltados_api)
localmente (clone em `../tiltados_api`, com o `.venv` criado como no README dela) e aponte o site para ela.
A variável de ambiente tem prioridade sobre o `.env.local`:

```powershell
# terminal 1, na pasta da API
.\.venv\Scripts\uvicorn.exe main:app --port 8000

# terminal 2, na pasta do site
$env:TILTADOS_API_URL = "http://127.0.0.1:8000"; npm run dev
```

### Simulando estados que ainda não aconteceram

Para ver na tela um caso que os dados reais ainda não têm (piloto Suspenso, Suspensão cumprida, Campeão
antes da última Sessão), suba a API simulada na frente da API local. Ela responde com o JSON da fixture
nas rotas que a fixture lista e repassa o resto:

```powershell
# terminal 2, na pasta do site (a API local continua no terminal 1)
node scripts/mock-api.mjs scripts/fixtures/superlicenca-suspensoes.json

# terminal 3
$env:TILTADOS_API_URL = "http://127.0.0.1:8010"; npm run dev -- --port 3002
```

Cada fixture em `scripts/fixtures/` é um objeto `{ "/rota": resposta }`. Para criar uma, copie a resposta
real da rota e altere os campos.

As rotas, o formato das respostas e as regras estão no README da API ("Endpoints Disponíveis", "Regras de
Negócio" e "Exemplos de Uso e Respostas"); o código parte do `main.py`.

## Como os dados são buscados

- A API é chamada **só pelo servidor do Next** (`src/lib/api.ts`), nunca pelo navegador.
  Em produção o site fala com ela direto em `http://127.0.0.1:8000`; no build do GitHub Actions, que
  roda fora do servidor, por HTTPS através do nginx em `/api` (a porta 8000 só aceita conexões locais).
- As respostas ficam em cache com `"use cache"` + `cacheLife("minutes")`: um CSV novo publicado na API
  aparece no site em cerca de um minuto, sem precisar de novo deploy.
- Pontos por sessão, voltas mais rápidas, rodadas e a evolução do campeonato são derivados em
  `src/lib/season.ts`, usando a mesma tabela de pontuação de `files/{season}/scores.csv` da API.
  As classificações (pilotos e construtores) vêm prontas da API, assim como a Chance de título de 2026,
  que a API calcula simulando as Sessões pendentes.
- O build (`npm run build`) pré-renderiza todas as páginas conhecidas, então a API precisa estar no ar
  durante o build.

## Design system

A pasta [`design-system/`](design-system/README.md) documenta a identidade visual do site: guia de uso
(voz, cores, tipografia, espaços, gráficos, acessibilidade), todos os tokens em `tokens.json` e
`tokens.css`, e uma ficha por componente com guia e prévia estática. Abra `design-system/index.html`
no navegador para ver todas as prévias, nos temas escuro e claro.

As cores usadas pelo site moram em `src/app/globals.css`; ao mudar uma cor, fonte ou componente,
atualize a pasta junto.

## Estrutura

```text
src/
├── app/[season]/          # rotas por temporada (visão geral, corridas, pilotos, equipes, título, superlicença)
├── components/            # cabeçalho, tabelas, gráficos de evolução e peças de UI
└── lib/
    ├── api.ts             # chamadas à Tiltados API (com cache)
    ├── chance.ts          # como a Chance de título aparece na tela (testado com o Vitest)
    ├── license.ts         # como o status da Superlicença aparece no card (testado com o Vitest)
    ├── season.ts          # modelo derivado da temporada
    ├── team-season.ts     # perfil da equipe e evolução do campeonato de construtores (testado com o Vitest)
    ├── teams.ts           # cores, logos e Carros das equipes, e o Jogo de cada temporada (testado com o Vitest)
    ├── types.ts           # tipos das respostas da API
    └── weekend.ts         # Sessões agrupadas por Etapa (testado com o Vitest)
```

Ao adicionar uma equipe nova na liga, inclua a cor dela em `src/lib/teams.ts` e em `src/app/globals.css`
(equipes desconhecidas aparecem em cinza). As logos ficam em `public/teams/`: `{equipe}.webp` (colorida,
usada no tema claro) e `{equipe}-white.webp` (branca, usada no tema escuro), obtidas da CDN oficial da F1
(`media.formula1.com/.../common/f1/{ano}/{equipe}/{ano}{equipe}logo[white].webp`). A branca da Kick
Sauber vem da pasta de 2024, porque a de 2025 é igual à colorida. Equipes sem logo mostram a barrinha na
cor da equipe.

Os Carros ficam em `public/cars/{ano do Carro}/{equipe}.webp`: as renderizações laterais da mesma CDN
(`.../common/f1/{ano}/{equipe}/{ano}{equipe}carright.png`, em 1200 px), convertidas para WebP com
transparência. Numa temporada nova, registre o Jogo e o ano dos Carros em `SEASON_GAMES` e as equipes com
Carro daquele ano em `CARS`, ambos em `src/lib/teams.ts`; o teste do módulo confere que os arquivos existem.
Detalhes em `design-system/assets/Carros.md`.
