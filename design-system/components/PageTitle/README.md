# PageTitle

Título de página com sobretítulo vermelho e subtítulo opcional.

## Quando usar
Uma vez no topo de cada página, antes de qualquer conteúdo.

## O que você fornece
- `eyebrow` (opcional): contexto curto, como "Temporada 2026" ou "Etapa 16 · 2026".
- `title`: o nome da página. Escreva em caixa normal; o componente põe em caixa alta.
- `children` (opcional): uma ou duas frases de subtítulo, em `text-2`.
- `car` (opcional): o Carro da equipe, de `teamCar`; as páginas que o usam estão na ficha do TeamCar. Vai no arranjo do WithTeamCar (ficha do TeamCar), o mesmo do card do líder: à direita do bloco de sobretítulo, título e subtítulo, até 320px e alinhado à base dele, a partir de 640px; abaixo do subtítulo, em largura total até 320px, no celular.

## Faça
- `eyebrow` em `accent`, 14px bold, espaçado; título em `page-title` (30px no celular, 48px no desktop), `space-8` abaixo.
- Equipe sem Carro no Jogo (`teamCar` devolve `undefined`): o título fica como sempre, sem espaço vazio.

## Evite
- Sobretítulo longo: no tema escuro o `accent` como texto fica em 3,81:1 sobre `bg`.

Fonte: `src/components/ui.tsx` · prévia estática.
