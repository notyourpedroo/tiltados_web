# Fluxo de trabalho

Toda mudança chega à `main` por **issue → branch → PR → revisão → merge**. A `main` é protegida: só aceita PR com o check "Verificar e empacotar" verde e o branch atualizado, inclusive para administradores. Cada push na `main` publica o site, então **o merge é a publicação**.

Há dois papéis:

- **Implementador**: o subagente (ou a sessão) que pega uma issue. Vai da issue até o PR aberto.
- **Sessão principal**: a sessão que despachou os implementadores, ou a própria sessão quando ela mesma implementou. Revisa o PR e faz o merge.

## Implementador

1. **Issue**: pegue uma issue `ready-for-agent` sem bloqueador aberto (consulta de fronteira em `docs/agents/issue-tracker.md`). Um bloqueador só fecha quando o PR dele entra na `main`, então o trabalho sempre parte do `origin/main`.
2. **Branch**: um branch novo `tipo/descricao-curta` a partir do `origin/main` atualizado, para cada issue. Num worktree, o branch do agente é renomeado (`docs/agents/worktrees.md`).
3. **Commits**: Conventional Commits em português sem acentos; o hook `commit-msg` confere o formato.
4. **Antes do PR**: `npm run lint`, `npm run typecheck` e `npm test` passam.
5. **PR**: `git push -u origin <branch>` e `gh pr create --base main`. O título segue Conventional Commits; o corpo segue a skill `pr` e traz `Closes #<issue>`, para o merge fechar a issue.

Pronto quando o PR está aberto e o implementador devolveu a URL dele. O merge fica com a sessão principal.

## Sessão principal: revisão

Revise cada PR contra a issue que ele fecha. A revisão termina com todos os itens abaixo conferidos e o resultado registrado num comentário no PR (`gh pr comment`):

- **CI**: `gh pr checks <pr>` mostra "Verificar e empacotar" como `pass`.
- **Spec**: cada critério de aceite da issue está atendido pelo diff, e o diff fica dentro do escopo da issue.
- **Padrões**: o diff segue o `CODING_STANDARDS.md` e os termos do `GLOSSARY.md`.
- **Tela**: mudança visível foi conferida no navegador a partir do checkout principal (`gh pr checkout <pr>`), com a API simulada quando o estado ainda não aconteceu.

A skill `mattpocock-skills:code-review`, apontada para o merge-base com a `main` e para a issue, cobre Spec e Padrões em paralelo.

## Sessão principal: merge

- **Tudo conferido**: `gh pr merge <pr> --merge --delete-branch`. O merge commit segue o padrão do histórico, e a issue fecha pelo `Closes`. Depois, remova o worktree do implementador (`docs/agents/worktrees.md`).
- **Branch desatualizado**: `gh pr update-branch <pr>` e espere o CI passar de novo antes do merge.
- **Algum item falhou**: comente no PR cada achado, com arquivo e o critério afetado, e devolva o PR ao implementador para corrigir no mesmo branch. A revisão recomeça do zero depois da correção.
- **Dúvida que só o usuário resolve** (critério ambíguo, mudança fora do escopo que parece desejada): deixe o PR aberto, explique no PR e pergunte ao usuário. Na dúvida, o PR espera.
