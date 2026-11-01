# ProgressionChart

Gráfico de linhas da evolução do campeonato, de pilotos ou de construtores, em pontos acumulados ou em posição, sessão a sessão.

## O que você fornece
- `mode`: `"points"` ou `"position"` (eixo invertido, 1º no topo, uma linha de grade por posição).
- `kind`: `"driver"` ou `"team"`. O texto acessível do gráfico e o da legenda falam de "cada piloto" ou "cada equipe".
- `sessions` e `series`: de `chartData(season)` em `src/lib/chart.ts` para os pilotos (cor da equipe, tracejado de companheiro, pontos e posições) ou de `constructorsProgression(season)` em `src/lib/team-season.ts` para as equipes (uma linha cheia por equipe, na cor dela).
- `selected` e `onToggle`: a seleção, normalmente de `useHighlight(series)` (até 3 linhas; a 4ª tira a mais antiga).

## Faça
- Destaques na cor `team-*` com 2px; o resto em `series-rest` com 1,5px. Piloto com companheiro à frente na classificação em tracejado 6 4, repetido na legenda e no tooltip.
- Ponto de 8px com anel `surface` e o nome mais o valor final no fim de cada linha destacada; se encostarem, uma linha-guia em `muted`.
- Crosshair em `text-2` e tooltip com todas as linhas na ordem daquela etapa (setas do teclado navegam; Esc fecha).

## Evite
- Mais de 3 destaques ou cores fora de `team-*`.

Fonte: `src/components/ProgressionChart.tsx` · prévia estática com os pilotos e as equipes de 2026, até R16 (tooltip fixo numa etapa).
