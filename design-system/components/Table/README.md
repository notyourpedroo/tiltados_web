# Table

Tabela no estilo das páginas de resultado da F1, dentro de um Card, com rolagem horizontal própria.

## Quando usar
Para qualquer lista comparável: classificações, resultados, punições.

## O que você fornece
- `children`: `<thead>` e `<tbody>`. Use as classes exportadas `th`, `td` e `tr` em cada célula e linha.
- `wide` (padrão `true`): mínimo de 560px, com rolagem dentro do card no celular. Use `false` em tabelas compactas.

## Faça
- Cabeçalho em `table-head` (11px, caixa alta, `muted`); células com `space-3`, e `space-4` na primeira e na última coluna.
- Linhas separadas por `line`; hover em `surface-2`.
- Números alinhados à direita, com algarismos tabulares; a coluna de pontos em 900.

Fonte: `src/components/ui.tsx` · prévia estática.
