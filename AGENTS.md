<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Fluxo de trabalho

Toda mudança chega à `main` protegida por issue → branch → PR → revisão → merge, e o merge publica o site. Ao pegar uma issue, abrir um PR ou revisar e mergear um PR, siga `docs/agents/workflow.md`.

## Agent skills

### Issue tracker

As issues ficam no GitHub Issues de notyourpedroo/tiltados_web, acessadas pelo CLI `gh`. See `docs/agents/issue-tracker.md`.

### Triage labels

Usa os cinco rótulos padrão (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: um `GLOSSARY.md` e `docs/adr/` na raiz. See `docs/agents/domain.md`.

### Worktrees

Subagentes em worktree: base do branch, `node_modules` e verificação. See `docs/agents/worktrees.md`.

### Tiltados API

Rotas, formato das respostas e regras (status, Suspensão, Chance de título) no `README.md` da API, em `../tiltados_api` ("Endpoints Disponíveis", "Regras de Negócio", "Exemplos de Uso e Respostas"); o código parte do `main.py`. Para rodar o site contra a API local ou simular estados que ainda não aconteceram, veja "Rodando contra a API local" e "Simulando estados que ainda não aconteceram" no `README.md`.
