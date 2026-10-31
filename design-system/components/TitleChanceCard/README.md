# TitleChanceCard

Card da Chance de título em 2026 no perfil do piloto e no da equipe, com as peças ChanceBadge e ChanceBar da página Chance de título (ver ChanceRow).

## Composição
- Card com padding `space-5`, 16px abaixo da grade de estatísticas.
- Cabeçalho: o rótulo em `label` `muted` à esquerda e o ChanceBadge à direita.
- Chance de título em 24px 900 (`tabular`), a ChanceBar logo abaixo e o Motivo em 14px `text-2`.

## O que você fornece
- `title`: "Chance de título" no piloto, "Chance de título de construtores" na equipe. Também vira o rótulo acessível da barra ("Chance de título: 87,3%").
- `view`: a Chance de título como exibida (`describeChance` em `src/lib/chance.ts`, com `"driver"` ou `"team"` para o selo concordar).
- `reason`: o Motivo da API.

## Faça
- Mostre o card para qualquer status, Campeão e Eliminado inclusive, sempre com o Motivo.
- Carregue à parte (Suspense com `HideOnError`): se a rota falhar, o card some e o resto do perfil aparece.

## Evite
- O card em temporada sem simulação (2025): ele só existe em 2026.

Fonte: `src/components/chance.tsx`, usado em `src/app/[season]/pilotos/[driverId]/page.tsx` e `src/app/[season]/equipes/[teamId]/page.tsx` · prévia estática com os dados de 2026.
