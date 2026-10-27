# Worktrees de agentes

Subagentes com `isolation: worktree` trabalham em `.claude/worktrees/agent-<id>/`, cada um no branch `worktree-agent-<id>`. O ESLint e o Vitest já ignoram `.claude/**`.

## Base do worktree

O worktree nasce da `main` do remoto (`origin/HEAD`), não do branch em que a sessão principal está. Para trabalhar sobre um commit local `<sha>` que ainda não está na `main`:

- antes de qualquer alteração, alinhe o branch do worktree com `git switch -C worktree-agent-<id> <sha>`;
- na integração, traga só os commits do agente com `git cherry-pick`, sem levar merges de alinhamento.

O `git reset --hard` costuma ser bloqueado pelas permissões; o `git switch -C` faz o mesmo num worktree limpo.

## node_modules

O worktree vem sem `node_modules`. Em vez de `npm install`, crie uma junction para o do checkout principal (PowerShell):

```powershell
New-Item -ItemType Junction -Path node_modules -Target E:\Dev\Code\tiltados_web\node_modules
```

Para apagar um worktree, desfaça a junction primeiro com `cmd /c rmdir node_modules` (remove só o link) e depois rode `git worktree remove`. Uma remoção recursiva com a junction no lugar apaga o `node_modules` do checkout principal.

## Verificação

- `npm run typecheck` gera os tipos de rota do Next (`next typegen`) antes do `tsc`; num worktree novo, o `tsc --noEmit` sozinho reclama de `PageProps`.
- `npm test` e `npm run lint` rodam como no checkout principal.
- Vários servidores de dev ao mesmo tempo disputam a porta 3000: verifique no navegador a partir do checkout principal, depois da integração.
