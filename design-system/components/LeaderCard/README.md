# LeaderCard

Card de destaque da Visão geral com o líder do campeonato (ou o campeão, em temporada encerrada).

## Composição
- Card com `stripe` e faixa de 6px na cor da equipe à esquerda; padding `space-6`.
- Rótulo em `gold` ("Líder do campeonato" ou "🏆 Campeão"), nome em `hero-name`, equipe com logo de 28px.
- Em 2026, abaixo da equipe, a linha da Chance de título: rótulo em `label`, a porcentagem em 24px 900 e a seta →, tudo como link para `/2026/titulo`.
- Números em `stat-hero` com rótulos em `label`: pontos, vitórias, pódios e a vantagem sobre o 2º ("+96 sobre Yohan").

## Faça
- Quando a API diz que o líder já é Campeão pela matemática, o rótulo vira "🏆 Campeão" e a linha da Chance some (seria só 100%).
- A Chance de título carrega à parte: se demorar ou falhar, o card mostra "Líder do campeonato" sem a linha.

Fonte: `src/app/[season]/page.tsx` · prévia estática com os dados de 2026.
