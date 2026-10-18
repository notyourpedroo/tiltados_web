# TeamCard

Card de uma equipe na página Equipes: posição, pontos e quanto cada piloto somou.

## Composição
- Card com `stripe`, faixa de 4px da equipe no topo e padding `space-5`.
- Logo de 44px, posição em `muted`, nome da equipe em 20px 900 caixa alta; pontos em `stat` à direita com "PTS".
- Barra de contribuição de 8px: um segmento por piloto, proporcional aos pontos, separados por 2px; o maior pontuador em cor cheia, os outros a 45%.
- Lista de pilotos com ponto na mesma intensidade, nome e pontos; no pé, vitórias e pódios em `muted`.

Fonte: `src/app/[season]/equipes/page.tsx` · prévia estática com os dados de 2026.
