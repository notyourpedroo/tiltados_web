# TeamCar

Carro da equipe: o carro dela no Jogo da temporada (em 2026, o F1 25, com os carros reais de 2025; em 2025, o F1 24, com os de 2024). Renderização lateral, decorativa, igual nos dois temas.

## O que você fornece
- `car`: o endereço devolvido por `teamCar(nomeDaEquipe, temporada)`. Sem Carro (`undefined`), o componente não desenha nada.
- `width`: a largura máxima em px (padrão 320). A imagem ocupa a largura disponível até esse valor, então encolhe em telas estreitas.
- `className`: para encaixar o Carro no layout (ex.: `flex-1 min-w-0` ao lado do nome).

## Nos cards grandes: WithTeamCar
`WithTeamCar` recebe `car` e, como `children`, o bloco do nome. Põe o Carro de até 320px à direita do nome, alinhado à base dele, a partir de 640px; no celular, abaixo do nome, em largura total até 320px. Sem Carro, devolve só o nome. É o arranjo do card do líder e do PageTitle (prop `car`, no perfil do piloto); use-o em vez de repetir as classes.

## Faça
- Use onde se "abre" um piloto ou uma equipe: card do líder (inclusive como Campeão), cabeçalho do perfil do piloto, linhas da Chance de título (ChanceRow).
- Tamanhos: até 320px nos cards grandes, pelo WithTeamCar; cerca de 100px nas linhas da Chance de título.
- Sempre com o nome da equipe em texto por perto: o Carro é decorativo (`alt=""`).
- Peça o endereço sempre a `teamCar`: ela sabe o Jogo de cada temporada e nunca devolve o Carro de outro ano.

## Evite
- Cards da página Equipes, tabelas de classificação, resultados de Sessão e Superlicença: ali fica só o logo.
- Reservar espaço para um Carro que não existe: equipe fora do Jogo aparece sem Carro, e o layout se fecha.
- Fundo em gradiente na cor da equipe atrás do Carro.

Fonte: `src/components/ui.tsx`, `src/lib/teams.ts` · prévia estática.
