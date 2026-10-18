# LastRaceCard

Card da Visão geral com o pódio da última corrida principal e o link para o resultado completo.

## Composição
- Rótulo "Última corrida · R16" em `muted`, nome do GP em `card-title`, local e data em `text-2` (com SprintBadge quando for sprint).
- Três linhas: posição na cor do pódio, TeamMark de 20px, nome em bold, equipe curta em `muted` e "+25 pts" à direita.
- MoreLink "Resultado completo" no pé.

Fonte: `src/app/[season]/page.tsx` · prévia estática com os dados de 2026.
