# PodiumCard

Os três cards do pódio no topo da página de uma corrida, na ordem 2-1-3, com o vencedor mais alto.

## Composição
- Card com `stripe`, faixa de 4px da equipe no topo e padding `space-5`.
- "1º" em `stat` na cor do pódio, logo da equipe de 40px à direita, nome em `card-title`, equipe em `text-2` e "Largou em 2º · +25 pts" em `muted`.
- No desktop o 1º sobe 16px; no celular os três empilham na ordem 1-2-3.

Fonte: `src/app/[season]/corridas/[raceId]/page.tsx` · prévia estática com os dados de 2026.
