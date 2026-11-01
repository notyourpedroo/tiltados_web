# Worktrees de agentes

Subagentes com `isolation: worktree` trabalham em `.claude/worktrees/agent-<id>/`, cada um no branch `worktree-agent-<id>`. O ESLint e o Vitest já ignoram `.claude/**`.

## Base do worktree

O worktree nasce da `main` do remoto (`origin/HEAD`), não do branch em que a sessão principal está. É a base certa: o agente só pega issues sem bloqueador aberto, e tudo de que ele depende já está na `main` (`docs/agents/workflow.md`). A exceção é o ticket de uma spec com branch de integração, que parte desse branch (`docs/agents/workflow.md`, "Spec com vários tickets"): confira com `git merge-base --is-ancestor <integração> HEAD` e, se não for ancestral, faça `git reset --hard <integração>` antes do primeiro commit.

Antes do primeiro commit, renomeie o branch para o nome da demanda com `git branch -m tipo/descricao-curta`; é esse branch que vai para o PR.

## node_modules

O worktree vem sem `node_modules`. Em vez de `npm install`, crie uma junction para o do checkout principal (PowerShell):

```powershell
New-Item -ItemType Junction -Path node_modules -Target E:\Dev\Code\tiltados_web\node_modules
```

Para apagar um worktree, desfaça a junction primeiro e depois rode `git worktree remove`. A junction sai com o comando abaixo, que remove só o link (o `cmd /c rmdir` é bloqueado pela ferramenta PowerShell); troque o caminho pelo do worktree:

```powershell
$nm = "E:\Dev\Code\tiltados_web\.claude\worktrees\agent-<id>\node_modules"
if ((Get-Item $nm -Force).LinkType -eq 'Junction') { [System.IO.Directory]::Delete($nm, $false) }
```

Uma remoção recursiva com a junction no lugar apaga o `node_modules` do checkout principal.

## Verificação

- `npm run typecheck` gera os tipos de rota do Next (`next typegen`) antes do `tsc`; num worktree novo, o `tsc --noEmit` sozinho reclama de `PageProps`.
- `npm test` e `npm run lint` rodam como no checkout principal.
- A conferência no navegador fica com a revisão do PR, no checkout principal (`gh pr checkout <pr>`). Quando ele está ocupado por outra sessão, rode o site no worktree:
  - O Turbopack recusa a junction de `node_modules`, que aponta para fora da raiz que ele deduz ("Symlink node_modules could not be resolved"). Aponte `TURBOPACK_ROOT` para o checkout principal, que contém o worktree e o `node_modules`: `$env:TURBOPACK_ROOT = "E:\Dev\Code\tiltados_web"`. Só para o `npm run dev`: no `npm run build` a variável também muda a raiz do pacote `standalone`.
  - Use o Turbopack: com `--webpack` a página sobe sem estilo, porque o Tailwind entra pelo loader `@tailwindcss/turbopack` do `next.config.ts`.
  - O `.env.local` não vem no worktree: copie o do checkout principal.
  - Use uma porta própria (`npm run dev -- --port 3005`), porque vários servidores de dev disputam a 3000.
