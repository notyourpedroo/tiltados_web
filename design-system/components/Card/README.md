# Card

Superfície base de todo bloco de conteúdo: fundo `surface`, borda de 1px em `line` e `radius-xl`.

## Quando usar
Para agrupar um conteúdo que se lê sozinho: tabela, gráfico, número, card de piloto. Cards de destaque (líder, pódio, equipe) somam a textura `stripe` e uma faixa de 4px na cor da equipe.

## O que você fornece
- `children` e `className` (o padding vem de fora: `space-4`, `space-5` ou `space-6`).

## Evite
- Sombra para separar cards. A borda já faz isso; a única sombra do sistema é a do tooltip.

Fonte: `src/components/ui.tsx` · prévia estática.
