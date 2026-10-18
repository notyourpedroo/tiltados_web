# ProgressionChart

Gráfico de linhas da evolução do campeonato, em pontos acumulados ou em posição, sessão a sessão.

## O que você fornece
- `mode`: `"points"` ou `"position"` (eixo invertido, 1º no topo, uma linha de grade por posição).
- `sessions` e `series`: de `chartData(season)` em `src/lib/chart.ts` (cor da equipe, tracejado de companheiro, pontos e posições).
- `selected` e `onToggle`: a seleção, normalmente de `useHighlight(series)` (até 3 pilotos; o 4º tira o mais antigo).

## Faça
- Destaques na cor `team-*` com 2px; o resto em `series-rest` com 1,5px. Companheiro atrás na classificação em tracejado 6 4, repetido na legenda e no tooltip.
- Ponto de 8px com anel `surface` e o nome mais o valor final no fim de cada linha destacada; se encostarem, uma linha-guia em `muted`.
- Crosshair em `text-2` e tooltip com todos os pilotos na ordem daquela etapa (setas do teclado navegam; Esc fecha).

## Evite
- Mais de 3 destaques ou cores fora de `team-*`.

Fonte: `src/components/ProgressionChart.tsx` · prévia estática com os dados de 2026 (tooltip fixo numa etapa).
