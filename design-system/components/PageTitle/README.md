# PageTitle

Título de página com sobretítulo vermelho e subtítulo opcional.

## Quando usar
Uma vez no topo de cada página, antes de qualquer conteúdo.

## O que você fornece
- `eyebrow` (opcional): contexto curto, como "Temporada 2026" ou "Etapa 16 · 2026".
- `title`: o nome da página. Escreva em caixa normal; o componente põe em caixa alta.
- `children` (opcional): uma ou duas frases de subtítulo, em `text-2`.
- `aside` (opcional): um elemento ao lado do título, como o Carro da equipe (TeamCar, até 320px) no perfil do piloto. Fica à direita do bloco de sobretítulo, título e subtítulo, alinhado à base dele, a partir de 640px; abaixo do subtítulo, em largura total até o tamanho dele, no celular.

## Faça
- `eyebrow` em `accent`, 14px bold, espaçado; título em `page-title` (30px no celular, 48px no desktop), `space-8` abaixo.
- Sem nada para o `aside` (equipe sem Carro no Jogo), não passe a prop: o título fica como sempre, sem espaço vazio.

## Evite
- Sobretítulo longo: no tema escuro o `accent` como texto fica em 3,81:1 sobre `bg`.

Fonte: `src/components/ui.tsx` · prévia estática.
