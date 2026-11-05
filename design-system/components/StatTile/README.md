# StatTile

Número de destaque com rótulo e uma linha de apoio.

## Quando usar
Em grades de 2 (celular) ou 4 colunas para os números-chave de uma temporada ou de um piloto.

## O que você fornece
- `label`: o que é, curto (vira caixa alta, `label`, `muted`).
- `value`: o número ou ordinal, em `stat`.
- `sub` (opcional): uma linha em `text-2`, cortada com reticências se passar.
- `description` (obrigatória): o que o indicador mede, de `src/lib/indicators.ts`. Põe o ícone ⓘ depois do rótulo e o card vira um [Tooltip](../Tooltip/README.md) com esse texto. Sem ela o card não compila: nenhum indicador sai sem explicação.

Fonte: `src/components/ui.tsx` · prévia estática.
