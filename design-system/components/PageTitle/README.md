# PageTitle

Título de página com sobretítulo vermelho e subtítulo opcional.

## Quando usar
Uma vez no topo de cada página, antes de qualquer conteúdo.

## O que você fornece
- `eyebrow` (opcional): contexto curto, como "Temporada 2026" ou "Etapa 16 · 2026".
- `title`: o nome da página. Escreva em caixa normal; o componente põe em caixa alta.
- `children` (opcional): uma ou duas frases de subtítulo, em `text-2`.

## Faça
- `eyebrow` em `accent`, 14px bold, espaçado; título em `page-title` (30px no celular, 48px no desktop), `space-8` abaixo.

## Evite
- Sobretítulo longo: sobre `bg`, o `accent` como texto fica em 3,81:1 no tema escuro e 4,48:1 no claro.

Fonte: `src/components/ui.tsx` · prévia estática.
