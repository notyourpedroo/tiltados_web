# Badge

Selo neutro do site: um rótulo curto ao lado de um nome. É a base do SprintBadge, do DriverPositionBadge e do selo Dupla nos Pilotos da equipe.

## Quando usar
Para marcar um item com uma palavra ou duas ("Sprint", "Dupla", "Matheus 2º"). Antes de criar um selo novo, use este.

## O que você fornece
- `children`: o texto do selo, escrito normal ("Dupla"); a caixa alta vem do estilo.
- `className`: extras, ex.: `whitespace-nowrap` para o selo não quebrar.

## Faça
- Fundo `surface-2`, texto `text-2`, `badge` (10px, 900, caixa alta, espaçamento entre letras), `radius-sm`, padding de 6px × 2px.
- Ao lado do nome, na mesma linha, com 8px de espaço.

## Evite
- Cor no selo: VMR, Chance de título e status da Superlicença têm selos próprios (FastestLapBadge, TitleChanceCard, LicenseCard).
- Copiar as classes num `span` em vez de usar o `Badge`.

Fonte: `src/components/ui.tsx` · usado em `src/components/TeamDrivers.tsx` · prévia estática.
