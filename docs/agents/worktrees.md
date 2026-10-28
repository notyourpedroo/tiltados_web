# Worktrees de agentes

Subagentes com `isolation: worktree` trabalham em `.claude/worktrees/agent-<id>/`, cada um no branch `worktree-agent-<id>`. O ESLint e o Vitest já ignoram `.claude/**`.

## Base do worktree

O worktree nasce da `main` do remoto (`origin/HEAD`), não do branch em que a sessão principal está. É a base certa: o agente só pega issues sem bloqueador aberto, e tudo de que ele depende já está na `main` (`docs/agents/workflow.md`).

Antes do primeiro commit, renomeie o branch para o nome da demanda com `git branch -m tipo/descricao-curta`; é esse branch que vai para o PR.

## node_modules

O worktree vem sem `node_modules`. Em vez de `npm install`, crie uma junction para o do checkout principal (PowerShell):

```powershell
New-Item -ItemType Junction -Path node_modules -Target E:\Dev\Code\tiltados_web\node_modules
```

Para apagar um worktree, desfaça a junction primeiro com `cmd /c rmdir node_modules` (remove só o link) e depois rode `git worktree remove`. Uma remoção recursiva com a junction no lugar apaga o `node_modules` do checkout principal.

## Verificação

- `npm run typecheck` gera os tipos de rota do Next (`next typegen`) antes do `tsc`; num worktree novo, o `tsc --noEmit` sozinho reclama de `PageProps`.
- `npm test` e `npm run lint` rodam como no checkout principal.
- Vários servidores de dev ao mesmo tempo disputam a porta 3000: a conferência no navegador fica com a revisão do PR, no checkout principal (`gh pr checkout <pr>`).
