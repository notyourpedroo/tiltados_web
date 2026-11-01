# Fluxo de trabalho

Toda mudança chega à `main` por **issue → branch → PR → revisão → merge**. A `main` é protegida: só aceita PR com o check "Verificar e empacotar" verde e o branch atualizado, inclusive para administradores. Cada push na `main` publica o site, então **o merge é a publicação**.

Há dois papéis:

- **Implementador**: o subagente (ou a sessão) que pega uma issue. Vai da issue até o PR aberto.
- **Sessão principal**: a sessão que despachou os implementadores, ou a própria sessão quando ela mesma implementou. Revisa o PR e faz o merge.

## Implementador

1. **Issue**: pegue uma issue `ready-for-agent` sem bloqueador aberto (consulta de fronteira em `docs/agents/issue-tracker.md`). Um bloqueador só fecha quando o PR dele entra na `main`, então o trabalho parte do `origin/main`. Ticket de uma spec com branch de integração segue "Spec com vários tickets", no fim deste arquivo.
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

Uma spec cujos tickets se bloqueiam entre si chega à `main` num PR só, a partir de um **branch de integração** `tipo/descricao-curta` criado do `origin/main`. O PR abre como rascunho depois do primeiro ticket integrado e traz um `Closes` para a spec e um para cada ticket. As regras acima valem para esse PR, com estas diferenças:

- **Fronteira**: os bloqueadores de um ticket só fecham no merge do PR. Ele fica pronto para pegar quando todos os bloqueadores já estão integrados no branch de integração.
- **Base do implementador**: o worktree parte do branch de integração, não da `main` (`docs/agents/worktrees.md`).
- **Implementador pronto**: não abre PR. Termina com o branch do ticket rebaseado sobre a ponta do branch de integração (`git rebase <integração>`, nunca merge), lint, typecheck e testes passando, e o nome do branch devolvido à sessão principal.
- **Integrar**: a sessão principal avança o branch de integração por fast-forward (`git branch -f <integração> <branch do ticket>` e push normal). Se o rebase do implementador ficou para trás, um subagente refaz o rebase e resolve os conflitos antes.
- **Tickets em paralelo no mesmo arquivo**: integre o que destrava os outros antes de despachar os dependentes, para eles partirem do módulo já unido.
- **`main` andou**: o `gh pr update-branch --rebase` reescreve o branch de integração no remoto. Depois dele, alinhe o branch local com `git branch -f <integração> origin/<integração>` antes do próximo fast-forward. Se ele falhar por conflito, refaça o rebase num branch local, confira com `git range-diff`, e publique com `git push --force-with-lease=<integração>:<ponta antiga>` só depois do OK do usuário, que é quem autoriza reescrever o branch publicado.
