# TeamLogo

Logo oficial da equipe na versão do tema ativo: branca no escuro, colorida no claro. TeamMark escolhe entre a logo e a TeamBar.

## O que você fornece
- `TeamLogo`: `logo` (`{light, dark}`, de `teamStyle`) e `size` (padrão 20).
- `TeamMark`: `team` (`{color, logo?}`) e `size`. Sem logo, desenha a barrinha da equipe.

## Faça
- Tamanhos: 14px sob o nome do piloto, 18 a 20px em tabelas e listas, 24px na classificação de construtores, 28 a 44px em cards.
- Sempre com o nome da equipe em texto ao lado: a logo é decorativa (`alt=""`).
- As duas versões são renderizadas juntas e o CSS esconde a do outro tema (`.only-dark`, `.only-light`).

Fonte: `src/components/ui.tsx`, `src/lib/teams.ts` · prévia estática.
