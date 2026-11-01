# Padrões de código

Regras de julgamento para a revisão. As regras mecânicas ficam no ESLint (`eslint.config.mjs`) e no hook `commit-msg` (`.githooks/`); não repita aqui o que eles já barram.

## Design system

- Toda tela e componente segue o `design-system/README.md` (voz, cor, tipografia, espaço, acessibilidade). Leia a seção Cor antes de revisar classes de cor: o lint pega `bg-accent`, hex e `muted` sobre `surface-2`, mas não pega, por exemplo, `text-accent` fora de sobretítulos, `gold` fora de pódio e "Campeão", ou um `status-*` da Superlicença usado para outra coisa.
- Componente novo ou alterado leva a ficha junto em `design-system/components/<Nome>/` (README e prévia) e as props em `components/index.d.ts`. O `design-system/components.test.ts` confere que a ficha existe, entra no `index.html` e tem props; confira na revisão se a prévia mostra cada variante nova (uma prop como `kind`, a versão da equipe) e se as props batem com o código. Mudança de fonte atualiza `tokens.json` e `tokens.css` (as cores, o `design-system/tokens.test.ts` já confere).
- Selos e medidores reaproveitam os padrões existentes (SprintBadge, LicenseCard) antes de inventar um estilo.

## Vocabulário

- Textos da tela, nomes de teste e de issue usam os termos do `GLOSSARY.md` (Etapa, Sessão, Corrida, Chance de título, Motivo...), evitando os sinônimos marcados como _Avoid_. O ESLint barra os inequívocos (carteira, gancho, ban...); confira os ambíguos, como "GP" no sentido de Etapa e "licença" no lugar de Superlicença. Identificadores que espelham a API (`prediction`, `race`) podem manter o nome da rota; os de conceitos que só o site tem usam o termo do glossário (`inDupla`), nunca um sinônimo _Avoid_.

## Documentação

- Página nova entra na tabela "Páginas" do `README.md`; arquivo novo em `src/lib/` entra na árvore "Estrutura".
