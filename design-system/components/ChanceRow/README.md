# ChanceRow

Linha de um piloto ou equipe na página Chance de título (`/2026/titulo`), com as peças ChanceBadge (selo de status) e ChanceBar (medidor), que também aparecem no bloco da página do piloto.

## Composição
- Item de lista dentro de um Card, separado por borda `line`; padding `space-4`.
- Cabeçalho: TeamMark, nome em 18px 900 (link para o piloto), equipe curta em `muted` a partir de 640px e a Chance de título à direita em 24px 900 (`tabular`).
- ChanceBar: 6px em `radius-full`, trilho `surface-2` e barra no tom do status (`role="meter"`, 0 a 100).
- Linha de apoio: ChanceBadge e "403 pts → 528 máx." em `text-2` (pontos atuais e Pontos máximos).
- Motivo em 14px `text-2`, quebrando linha.

## Selos (ChanceBadge)
- Campeão / Campeã: `gold-fill` com `on-fill`.
- Na disputa: invertido, fundo `text` e texto `bg`.
- Eliminado / Eliminada: `surface-2` com `text-2`, como o selo Sprint.
- `badge` (10px, 900, caixa alta), `radius-sm`; o rótulo concorda com piloto ou equipe.

## Faça
- Porcentagem no padrão brasileiro ("87,3%", "100%"). Quem está Na disputa com 0 ou 100 arredondados aparece como "< 0,1%" ou "> 99,9%".
- Eliminados esmaecem pela cor: nome e porcentagem em `text-2`. Nada de opacidade, que derruba o contraste.
- Título decidido (ninguém Na disputa no campeonato): a seção ganha "Título decidido" em `gold` ao lado do título, a barra e a porcentagem somem, o selo sobe para a direita e o Motivo vira o conteúdo principal em 16px 600 `text`.

## Evite
- `accent` em selo ou barra: ele é reservado para faixa, logotipo, aba ativa e sobretítulos.
- Os `status-*` da Superlicença: têm significado disciplinar.

Fonte: `src/components/chance.tsx` e `src/app/[season]/titulo/page.tsx` · prévia estática com os dados de 2026.
