# SiteHeader

Cabeçalho fixo do site: faixa vermelha, logotipo, seletor de temporada, botão de tema e abas das seções.

## Quando usar
Uma vez por página, no topo do layout da temporada (`src/app/[season]/layout.tsx`). Fica grudado no topo ao rolar, com fundo `bg` a 95% e desfoque.

## O que você fornece
Nada: ele lê a temporada e a seção pela URL (`usePathname`). As abas Título e Superlicença só aparecem em 2026 (a ordem é Visão geral, Etapas, Pilotos, Equipes, Título, Superlicença). Trocar de temporada mantém a seção, mas volta para a lista (os IDs mudam entre temporadas).

## Faça
- Logotipo: TILTADOS em `on-accent` sobre `accent`, inclinado −12°, seguido de F1 em `text-2`.
- Aba ativa com texto `text` e sublinhado de 2px em `accent`; as outras em `muted`.
- Temporada ativa invertida: fundo `text`, texto `bg`.

## Evite
- Pôr mais itens na linha do logotipo: no celular só cabem o logotipo, a temporada e o tema.

Fonte: `src/components/SiteHeader.tsx` · prévia estática.
