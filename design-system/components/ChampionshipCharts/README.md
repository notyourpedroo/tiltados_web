# ChampionshipCharts

Os dois gráficos de evolução da página, "Evolução do campeonato | Pontos" e "Evolução do campeonato | Posição", com a seleção compartilhada.

## Quando usar
Nas abas Visão geral e Pilotos, abaixo das classificações, com os pilotos; na aba Equipes, abaixo dos cards das equipes, com as equipes.

## O que você fornece
- `kind`: `"driver"` (campeonato de pilotos) ou `"team"` (campeonato de construtores). Decide o texto da dica ("destacar até 3 pilotos" ou "até 3 equipes") e o texto acessível dos gráficos.
- `sessions` e `series`: de `chartData(season)` para os pilotos ou de `constructorsProgression(season)` (`src/lib/team-season.ts`) para as equipes. O componente cria a seleção com `useHighlight` e passa para os dois ProgressionChart: destacar uma linha num gráfico destaca no outro.

Fonte: `src/components/ChampionshipCharts.tsx` · prévia estática com os pilotos de 2026.
