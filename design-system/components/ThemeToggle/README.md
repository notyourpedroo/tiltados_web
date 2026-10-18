# ThemeToggle

Botão redondo que alterna o tema entre automático, claro e escuro, nessa ordem.

## Quando usar
Só no SiteHeader. A escolha fica no `localStorage` (chave `theme`) e vale para todas as abas; "automático" segue o sistema operacional. Um script no `<head>` (`THEME_INIT_SCRIPT`) aplica o tema antes da primeira pintura.

## O que você fornece
Nada. O ícone mostra o estado atual (monitor, sol, lua) e o `aria-label` diz o atual e o próximo: "Tema claro. Trocar para escuro".

## Faça
- 32×32px, borda `line`, `radius-full`, ícone em `text-2` (`text` no hover).
- Ícones SVG de traço 2px, pontas arredondadas, 18px.

Fonte: `src/components/ThemeToggle.tsx` · prévia estática.
