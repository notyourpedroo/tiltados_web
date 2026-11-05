# Tooltip

Card que explica o que o indicador mede num balão abaixo dele (ou acima, perto do rodapé), com o ícone ⓘ (`InfoIcon`) ao lado do rótulo.

## Quando usar
Nos cards de indicador: o `StatTile` com `description` já usa, e um card próprio (como "Melhor forma recente") envolve o conteúdo nele. O texto vem de `src/lib/indicators.ts`, um registro por sujeito (`DRIVER_INDICATORS`), nos termos do `GLOSSARY.md`.

## O que você fornece
- `description`: uma ou duas frases curtas para o torcedor.
- `children`: o conteúdo do card, com o `InfoIcon` depois do rótulo.
- `className`: as classes do card (borda, fundo, espaço).

## Comportamento
- O critério é o dispositivo ter hover (`(hover: hover)`), não a largura: um notebook com a janela estreita continua no hover, um tablet usa o toque.
- Com hover: abre ao passar o mouse sobre o card inteiro ou ao focá-lo pelo teclado; fecha ao sair ou perder o foco.
- Sem hover: abre e fecha com toque no card; toque fora fecha; abrir um fecha o outro (só um aberto por vez). Tocar num link dentro do card navega e fecha o tooltip, sem abri-lo.
- Esc fecha. O balão descreve o card para leitores de tela (`aria-describedby`); o ⓘ é decorativo.
- Fechado, não ocupa espaço. Aberto, alinha à esquerda do card, até 288px, e é empurrado para dentro com 16px de folga da borda da janela: nunca causa rolagem horizontal.
- Abre abaixo do card e, quando abaixo não cabe com 16px de folga do rodapé, acima dele; se não cabe em nenhum lado, abre para o lado com mais espaço. Ao rolar ou redimensionar a janela com ele aberto, se reposiciona. O cálculo fica em `src/lib/tooltip.ts`.

## Faça
- Balão como o tooltip dos gráficos: `radius-lg`, borda `line`, fundo `bg` a 95%, `shadow-tooltip`, texto 14px em `text`.
- Card focável com anel de foco de 2px em `text-2`.

Fonte: `src/components/Tooltip.tsx` · prévia estática (o primeiro card aparece aberto).
