# ChampionshipCharts

Os dois gráficos de evolução da página, "Evolução do campeonato | Pontos" e "Evolução do campeonato | Posição", com a seleção de pilotos compartilhada.

## Quando usar
Nas abas Visão geral e Pilotos, abaixo das classificações.

## O que você fornece
- `sessions` e `series`: de `chartData(season)`. O componente cria a seleção com `useHighlight` e passa para os dois ProgressionChart: destacar um piloto num gráfico destaca no outro.

Fonte: `src/components/ChampionshipCharts.tsx` · prévia estática com os dados de 2026.
