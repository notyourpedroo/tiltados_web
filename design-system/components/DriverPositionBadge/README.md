# DriverPositionBadge

Selo de um piloto com a posição dele numa Sessão, ex.: "Matheus 2º". Na tabela de Resultados do perfil da equipe, cada piloto que correu pela equipe na Sessão ganha um selo, em ordem de chegada, então a linha serve mesmo quando a dupla mudou no meio do ano.

## O que você fornece
- `name`: o primeiro nome do piloto.
- `position`: a posição de chegada na Sessão; o selo escreve o ordinal.

## Faça
- O mesmo selo neutro do SprintBadge: fundo `surface-2`, nome em `text-2`, `badge` (10px, 900, caixa alta), `radius-sm`. O ordinal fica em `text` e algarismos tabulares.
- Selos lado a lado com 4px de espaço, quebrando linha se a célula apertar; o selo em si não quebra.

## Evite
- Cor de pódio no selo: a posição já vem escrita, e `gold` fica para o número da posição e "Campeão".

Fonte: `src/components/ui.tsx` · usado em `src/app/[season]/equipes/[teamId]/page.tsx` · prévia estática.
