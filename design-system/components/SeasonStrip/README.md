# SeasonStrip

Resumo da temporada no perfil do piloto e no da equipe: uma célula por sessão disputada. No piloto, a célula mostra a posição de chegada; na equipe, os pontos que ela fez na sessão.

## Composição
- Células de 40×40px com `radius-md`, número em 14px 900 e a etapa em 8px embaixo ("R5", ou "SPR" na sprint).
- 1º, 2º e 3º em `gold-fill`, `silver-fill` e `bronze-fill` com `on-fill`; com pontos em `surface-2` e `text`; sem pontos em `bg` e `muted`. Na equipe, vale a melhor posição de um piloto dela na sessão.
- Cada célula é um link para a corrida, com `title` "GP de Mônaco — 1º" no piloto e "GP de Mônaco — 43 pontos" na equipe.

## O que você fornece
- `season` e uma célula por Sessão disputada, com `value` (o número da célula), `position` (a que dá a medalha), `points` (com ou sem pontos) e `title`.
- Na equipe sem Sessão disputada, a seção mantém o título "Temporada em resumo" e mostra "Nenhuma Sessão disputada ainda" no lugar das células, como Pilotos da equipe e Resultados.

Fonte: `src/components/SeasonStrip.tsx`, usado em `src/app/[season]/pilotos/[driverId]/page.tsx` e `src/app/[season]/equipes/[teamId]/page.tsx` · prévia estática com o Matheus em 2026.
