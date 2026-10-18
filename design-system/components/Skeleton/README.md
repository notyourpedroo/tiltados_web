# Skeleton

Esqueleto de carregamento: blocos pulsando no lugar do título e das linhas enquanto os dados chegam da API.

## Quando usar
Como `fallback` do `<Suspense>` de cada página.

## O que você fornece
- `rows` (padrão 6): quantas linhas desenhar, aproximando o conteúdo real da página.

## Faça
- Título em `surface-2` com `radius-sm`; linhas de 48px em `surface` com `radius-lg`; `aria-busy` e o rótulo "Carregando".

Fonte: `src/components/ui.tsx` · prévia estática.
