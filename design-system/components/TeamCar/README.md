# TeamCar

Carro da equipe: o carro dela no Jogo da temporada (em 2026, o F1 25, com os carros reais de 2025; em 2025, o F1 24, com os de 2024). Renderização lateral, decorativa, igual nos dois temas.

## O que você fornece
- `car`: o endereço devolvido por `teamCar(nomeDaEquipe, temporada)`. Sem Carro (`undefined`), o componente não desenha nada.
- `width`: a largura máxima em px (padrão 320). A imagem ocupa a largura disponível até esse valor, então encolhe em telas estreitas.
- `className`: para encaixar o Carro no layout (ex.: `flex-1 min-w-0` ao lado do nome).

## Faça
- Use onde se "abre" um piloto ou uma equipe: card do líder (inclusive como Campeão), cabeçalho do perfil do piloto e da equipe, linhas da Chance de título.
- Tamanhos: até 320px nos cards grandes, ao lado do nome no desktop e abaixo dele no celular; cerca de 100px nas linhas da Chance de título.
- Sempre com o nome da equipe em texto por perto: o Carro é decorativo (`alt=""`).
- Peça o endereço sempre a `teamCar`: ela sabe o Jogo de cada temporada e nunca devolve o Carro de outro ano.

## Evite
- Cards da página Equipes, tabelas de classificação, resultados de Sessão e Superlicença: ali fica só o logo.
- Reservar espaço para um Carro que não existe: equipe fora do Jogo aparece sem Carro, e o layout se fecha.
- Fundo em gradiente na cor da equipe atrás do Carro.

Fonte: `src/components/ui.tsx`, `src/lib/teams.ts` · prévia estática.
