# TeamDrivers

Lista dos Pilotos da equipe no perfil da equipe: todo piloto que disputou ao menos uma Sessão por ela, com os pontos que fez por ela.

## Composição
- Card sem padding; uma linha por piloto com padding `space-3` × `space-4`, separadas por borda `line`.
- Nome do piloto em 900, como link para o perfil dele; pontos em bold `tabular` à direita, com "pts" em `caption` `muted`.
- Ordem: do maior pontuador para o menor.

## Faça
- A Dupla (os pilotos que a equipe tem no cadastro) fica em destaque: nome em 18px `text` e o selo "Dupla" no padrão do SprintBadge (`surface-2`, `text-2`, `badge`, `radius-sm`).
- Quem só passou pela equipe aparece com o nome em `text-2`, sem selo, e com os pontos que fez por ela, nunca os da temporada inteira.
- Equipe sem Sessão disputada não mostra a lista nem os duelos: a página mostra um só aviso, "Nenhuma Sessão disputada ainda", no lugar dos pilotos, duelos, temporada em resumo e Resultados.

## Evite
- Total da equipe na lista: os pontos dela já estão na grade de estatísticas, e a soma da lista bate com eles.

Fonte: `src/components/TeamDrivers.tsx`, usado em `src/app/[season]/equipes/[teamId]/page.tsx` · prévia estática com dados de 2026 e um terceiro piloto hipotético, para mostrar quem só passou pela equipe.
