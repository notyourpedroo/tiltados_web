# Fluxo de trabalho

Toda mudança chega à `main` por **issue → branch → PR → revisão → merge**. A `main` é protegida: só aceita PR com o check "Verificar e empacotar" verde e o branch atualizado, inclusive para administradores. Cada push na `main` publica o site, então **o merge é a publicação**.

Há dois papéis:

- **Implementador**: o subagente (ou a sessão) que pega uma issue. Vai da issue até o PR aberto.
- **Sessão principal**: a sessão que despachou os implementadores, ou a própria sessão quando ela mesma implementou. Revisa o PR e faz o merge.

## Implementador

1. **Issue**: pegue uma issue `ready-for-agent` sem bloqueador aberto (consulta de fronteira em `docs/agents/issue-tracker.md`). Um bloqueador só fecha quando o PR dele entra na `main`, então o trabalho parte do `origin/main`. Ticket de uma spec com branch de integração segue "Spec com vários tickets", no fim deste arquivo.
2. **Branch**: um branch novo `tipo/descricao-curta` a partir do `origin/main` atualizado (ou do branch de integração, no ticket de spec), para cada issue. Num worktree, o branch do agente é renomeado (`docs/agents/worktrees.md`).
3. **Commits**: Conventional Commits em português sem acentos; o hook `commit-msg` confere o formato. O merge é por rebase, então cada commit entra na `main` como está: correções de revisão viram commits próprios com mensagem que se explica sozinha, e nunca um merge da `main` dentro do branch. O `git add -p` não roda aqui: quando duas mudanças do mesmo arquivo vão para commits diferentes, faça as edições na ordem dos commits e commite entre elas.
4. **Antes do PR**: `npm run lint`, `npm run typecheck` e `npm test` passam. Mudança de tela passa também em `node scripts/rolagem.mjs` com o site de pé: sem rotas, ele percorre o site inteiro em 375, 640, 768, 1024 e 1280 px (cerca de 2 min) e falha apontando a rota, a largura e o elemento que estoura a janela.
5. **PR**: `git push -u origin <branch>` e `gh pr create --base main`. O título segue Conventional Commits; o corpo segue a skill `pr` e traz `Closes #<issue>`, para o merge fechar a issue. Quando a issue pede capturas, rode `node scripts/capturas.mjs <pasta> --pr <n> <rota>...` com o site de pé: ele fotografa cada rota no desktop e no celular, nos temas claro e escuro, publica as PNGs no branch órfão `capturas/pr-<n>` e imprime o markdown para colar no corpo do PR (`gh pr edit <n> --body-file`). O `gh` não sobe imagens; esse branch é o caminho. As capturas trazem o selo de dev do Next no canto, que não é do site.

Pronto quando o PR está aberto e o implementador devolveu a URL dele. O merge fica com a sessão principal.

## Sessão principal: revisão

Revise cada PR contra a issue que ele fecha. A revisão termina com todos os itens abaixo conferidos e o resultado registrado num comentário no PR (`gh pr comment`):

- **CI**: `gh pr checks <pr>` mostra "Verificar e empacotar" como `pass`.
- **Spec**: cada critério de aceite da issue está atendido pelo diff, e o diff fica dentro do escopo da issue.
- **Padrões**: o diff segue o `CODING_STANDARDS.md` e os termos do `GLOSSARY.md`.
- **Tela**: mudança visível foi conferida no navegador a partir do checkout principal (`gh pr checkout <pr>`), com a API simulada quando o estado ainda não aconteceu, e `node scripts/rolagem.mjs` passa. Quando a issue pede capturas, elas estão no corpo do PR (`scripts/capturas.mjs`, no passo 5 do implementador).

A skill `mattpocock-skills:code-review`, apontada para o merge-base com a `main` e para a issue, cobre Spec e Padrões em paralelo.

## Sessão principal: merge

- **Tudo conferido**: se o branch do PR está em checkout num worktree, desfaça a junction do `node_modules` dele antes (`docs/agents/worktrees.md`). Depois, `gh pr merge <pr> --rebase --delete-branch`. Os commits do PR entram na `main` em linha, sem merge commit, e a issue fecha pelo `Closes`. O merge termina com cada issue citada num `Closes` fechada (`gh issue view <n> --json state`): o GitHub às vezes fecha só parte delas, e a que ficou aberta fecha com `gh issue close <n> --comment "Entregue no PR #<pr>."`. Depois, remova o worktree do implementador (`docs/agents/worktrees.md`). As capturas só servem à revisão: se o PR tem um branch `capturas/pr-<n>`, tire do corpo do PR a seção que aponta para ele (`gh pr edit <pr> --body-file`), para não ficarem imagens quebradas, e apague o branch com `git push origin --delete capturas/pr-<n>`.
- **Branch desatualizado**: `gh pr update-branch <pr> --rebase` e espere o CI passar de novo antes do merge.
- **Algum item falhou**: separe os achados em dois tipos.
  - **Bloqueiam o merge**: critério de aceite não atendido, quebra de regra do `CODING_STANDARDS.md`, ou comportamento errado.
  - **Não bloqueiam**: smell e julgamento de redação ou de estilo. Ficam registrados no comentário, e o implementador corrige só se a correção for barata.

  Comente no PR cada achado, com arquivo, critério afetado e o tipo, e devolva o PR ao implementador para corrigir no mesmo branch os que bloqueiam. Achado que não bloqueia não devolve o PR.
- **Revisão depois da correção**: confira o CI na ponta nova, confira se cada achado anterior foi resolvido, e revise só o diff novo (`git diff <ponta revisada>..<ponta nova>`), não o PR inteiro. O PR entra quando essa rodada não tem achado que bloqueie.
- **Dúvida que só o usuário resolve** (critério ambíguo, mudança fora do escopo que parece desejada): deixe o PR aberto, explique no PR e pergunte ao usuário. Na dúvida, o PR espera.

## Spec com vários tickets

Uma spec cujos tickets se bloqueiam entre si chega à `main` num PR só, a partir de um **branch de integração** `tipo/descricao-curta` criado do `origin/main`. O PR abre como rascunho depois do primeiro ticket integrado e traz um `Closes` para a spec e um para cada ticket. As regras acima valem para esse PR, com estas diferenças:

- **Fronteira**: os bloqueadores de um ticket só fecham no merge do PR, então a consulta de fronteira não serve aqui. Quem despacha é a sessão principal: um ticket fica pronto quando todos os bloqueadores dele já entraram no branch de integração, o que a lista do corpo do PR registra.
- **Base do implementador**: o worktree parte da ponta do branch de integração no remoto, não da `main` (`docs/agents/worktrees.md`).
- **Implementador pronto**: não abre PR. Termina com o branch do ticket rebaseado sobre a ponta do branch de integração (`git fetch` e `git rebase origin/<integração>`, nunca merge), lint, typecheck e testes passando, e o nome do branch devolvido à sessão principal.
- **Integrar**: a sessão principal avança o branch de integração por fast-forward e publica com push normal. Num worktree com o branch de integração em checkout, é `git merge --ff-only <branch do ticket>`; sem checkout, é `git fetch origin <branch do ticket>:<integração>`, que recusa o que não for fast-forward. Se o rebase do implementador ficou para trás, um subagente refaz o rebase e resolve os conflitos antes. Ao integrar um ticket, marque-o na lista do corpo do PR.
- **Tickets em paralelo no mesmo arquivo**: integre o que destrava os outros antes de despachar os dependentes, para eles partirem do módulo já unido.
- **`main` andou**: o `gh pr update-branch --rebase` reescreve o branch de integração no remoto. Depois dele, rode `git fetch` e alinhe o branch local (`git branch -f <integração> origin/<integração>`) antes de integrar ou despachar o próximo ticket. Se o `update-branch` falhar por conflito, refaça o rebase num branch local, confira com `git range-diff` e publique com `git push --force-with-lease=<integração>:<ponta antiga>` só depois do OK do usuário, que é quem autoriza reescrever o branch publicado.
