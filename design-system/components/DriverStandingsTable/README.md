# DriverStandingsTable

Classificação de pilotos: posição, piloto com a cor da equipe, vitórias, sprints, pódios, diferença para o líder e pontos.

## O que você fornece
- `data`: a temporada (`SeasonData`, de `getSeason`).
- `limit` (opcional): quantas linhas.
- `compact` (padrão `false`): versão da Visão geral, só com Pos, Piloto, Pódios e Pts e o nome curto da equipe sob o piloto.

## Faça
- No celular a coluna Equipe some e o nome curto da equipe, com mini logo de 14px, desce para baixo do piloto.
- Diferença para o líder com sinal de menos tipográfico (−117); o líder mostra "—".

Fonte: `src/components/standings.tsx` · prévia estática.
