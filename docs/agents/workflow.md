# Fluxo de trabalho

Toda mudança chega à `main` por **issue → branch → PR → revisão → merge**. A `main` é protegida: só aceita PR com o check "Verificar e empacotar" verde e o branch atualizado, inclusive para administradores. Cada push na `main` publica o site, então **o merge é a publicação**.

Há dois papéis:

- **Implementador**: o subagente (ou a sessão) que pega uma issue. Vai da issue até o PR aberto.
- **Sessão principal**: a sessão que despachou os implementadores, ou a própria sessão quando ela mesma implementou. Revisa o PR e faz o merge.

## Implementador

1. **Issue**: pegue uma issue `ready-for-agent` sem bloqueador aberto (consulta de fronteira em `docs/agents/issue-tracker.md`). Um bloqueador só fecha quando o PR dele entra na `main`, então o trabalho sempre parte do `origin/main`.
2. **Branch**: um branch novo `tipo/descricao-curta` a partir do `origin/main` atualizado, para cada issue. Num worktree, o branch do agente é renomeado (`docs/agents/worktrees.md`).
3. **Commits**: Conventional Commits em português sem acentos; o hook `commit-msg` confere o formato. O merge é por rebase, então cada commit entra na `main` como está: correções de revisão viram commits próprios com mensagem que se explica sozinha, e nunca um merge da `main` dentro do branch.
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

- **Tudo conferido**: `gh pr merge <pr> --rebase --delete-branch`. Os commits do PR entram na `main` em linha, sem merge commit, e a issue fecha pelo `Closes`. Depois, remova o worktree do implementador (`docs/agents/worktrees.md`).
- **Branch desatualizado**: `gh pr update-branch <pr> --rebase` e espere o CI passar de novo antes do merge.
- **Algum item falhou**: comente no PR cada achado, com arquivo e o critério afetado, e devolva o PR ao implementador para corrigir no mesmo branch. A revisão recomeça do zero depois da correção.
- **Dúvida que só o usuário resolve** (critério ambíguo, mudança fora do escopo que parece desejada): deixe o PR aberto, explique no PR e pergunte ao usuário. Na dúvida, o PR espera.

## Spec com vários tickets

Uma spec cujos tickets se bloqueiam entre si (a #29 e os #30 a #34) chega à `main` num PR só, a partir de um **branch de integração** `tipo/descricao-curta` criado do `origin/main`. O PR abre como rascunho depois do primeiro ticket integrado e traz um `Closes` para a spec e um para cada ticket. As regras acima valem para esse PR, com estas diferenças:

- **Base do implementador**: o worktree parte do branch de integração, não da `main`. O implementador confere com `git merge-base --is-ancestor <integração> HEAD` e, se não for, faz `git reset --hard <integração>`.
- **Antes de devolver**: o implementador faz `git rebase <integração>`, nunca merge, e roda lint, typecheck e testes de novo. O histórico continua linear.
- **Integrar**: a sessão principal avança o branch de integração por fast-forward (`git branch -f <integração> <branch do ticket>` e push normal). Só quando o rebase do implementador ficou para trás é que um subagente refaz o rebase e resolve os conflitos.
- **Tickets em paralelo no mesmo arquivo**: integre o que destrava os outros antes de despachar os dependentes, para eles partirem do módulo já unido.
- **`main` andou com conflito**: o `gh pr update-branch --rebase` falha. Refaça o rebase num branch local, confira com `git range-diff`, e publique com `git push --force-with-lease=<integração>:<ponta antiga>` só depois do OK do usuário, que é quem autoriza reescrever o branch publicado.
