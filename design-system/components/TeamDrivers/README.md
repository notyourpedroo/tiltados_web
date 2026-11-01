# TeamDrivers

Lista dos Pilotos da equipe no perfil da equipe: todo piloto que disputou ao menos uma Sessão por ela, com os pontos que fez por ela.

## Composição
- Card sem padding; uma linha por piloto com padding `space-3` × `space-4`, separadas por borda `line`.
- Nome do piloto em 900, como link para o perfil dele; pontos em bold `tabular` à direita, com "pts" em `caption` `muted`.
- Ordem: do maior pontuador para o menor.

## Faça
- A Dupla (os pilotos que a equipe tem no cadastro) fica em destaque: nome em 18px `text` e o selo "Dupla" no `Badge` neutro de `ui.tsx`, o mesmo do SprintBadge (`surface-2`, `text-2`, `badge`, `radius-sm`).
- Quem só passou pela equipe aparece com o nome em `text-2`, sem selo, e com os pontos que fez por ela, nunca os da temporada inteira.
- Equipe sem Sessão disputada mantém o título "Pilotos da equipe" e mostra, no lugar da lista e dos duelos, o aviso "Nenhuma Sessão disputada ainda" num Card com padding `space-6` em `text-2`. Temporada em resumo e Resultados fazem o mesmo.

## Evite
- Total da equipe na lista: os pontos dela já estão na grade de estatísticas, e a soma da lista bate com eles.

Fonte: `src/components/TeamDrivers.tsx`, usado em `src/app/[season]/equipes/[teamId]/page.tsx` · prévia estática com dados de 2026 e um terceiro piloto hipotético, para mostrar quem só passou pela equipe.
