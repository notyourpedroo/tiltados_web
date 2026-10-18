# Design system — Tiltados F1

Tiltados F1 é o site de resultados de uma liga de F1 virtual entre amigos, no espírito das páginas de resultados e das transmissões da Fórmula 1: fundo escuro de carbono, vermelho F1, números grandes e as cores de cada equipe. Ele mostra classificações, resultados por corrida, evolução do campeonato e a Superlicença. Use este sistema para qualquer tela nova do site.

## Conteúdo e voz

- Escreva em português do Brasil, direto e curto, como um narrador de transmissão que conhece todo mundo pelo nome. Pilotos são tratados pelo primeiro nome ("Matheus", "Yohan").
- Use os termos da F1 sem traduzir à força: GP, Sprint, pole, pódio, grid, volta mais rápida (abreviada **VMR** no selo), construtores, Superlicença.
- Posições sempre com ordinal: `1º`, `2º`, `12º`. Etapas como `R16`. Datas no formato `05 out 2026` (mês abreviado em minúsculas), sem dia da semana.
- Pontos como número puro (`385`, `+25 pts` só quando é um ganho). Diferença para o líder com sinal de menos tipográfico: `−117`.
- Títulos e rótulos em CAIXA ALTA via estilo, não digitados assim no texto: "Resultados das corridas" vira RESULTADOS DAS CORRIDAS na tela.
- Plural sempre pelo helper do projeto (`plural(n, "punição", "punições")`), nunca colando sufixos.
- Emoji só nos lugares onde a transmissão também usaria um símbolo: 🏆 em "Campeão", ⚠ no aviso de punição, ⏱ no selo VMR e 👏 em "Nenhuma punição registrada até agora". Nada de emoji decorativo.
- Exemplos reais: "Líder do campeonato", "Maior recuperação · Do 7º ao 4º lugar", "Toque nos nomes para destacar até 3 pilotos", "Bandeira vermelha · Não deu para carregar os dados", "404 · Fora da pista".

## Cor

- O site nasce escuro: o tema `dark` é o primeiro e o padrão. O tema `light` vale quando o sistema pede ou quando a pessoa escolhe no botão de tema.
- Página em `bg`; cards e tabelas em `surface` com borda de 1px em `line`; destaque de linha (hover) e chips ativos em `surface-2`.
- Texto em `text`, apoio em `text-2`, rótulos e eixos em `muted`. Não ponha `muted` sobre `surface-2` (fica abaixo de 4,5:1).
- `accent` é o vermelho F1 e aparece pouco: faixa de 4px no topo, bloco do logotipo, sublinhado da aba ativa e sobretítulos. Nunca como fundo de botão nem em texto corrido. Texto sobre ele é sempre `on-accent`.
- Pódio: `gold`, `silver` e `bronze` coloram o número da posição (1, 2, 3) e o rótulo "Líder do campeonato". Quando a medalha vira fundo (resumo da temporada), use `gold-fill`, `silver-fill`, `bronze-fill` com `on-fill` por cima, iguais nos dois temas.
- `gain` (▲) e `loss` (▼) só para posições ganhas e perdidas e pontos deduzidos; a seta ou o sinal sempre acompanham a cor.
- `purple` é exclusivo da volta mais rápida.
- Status da Superlicença usam `status-regular`, `status-atencao`, `status-alerta`, `status-suspenso`, sempre com ícone (✓, !, ‼, ⛔) e o rótulo escrito. O trilho do medidor é a própria cor a 20% (`color-mix`). Nunca reaproveite essas cores para outra coisa.
- Toda cor sai de um token: no código, nenhum hex fora de `globals.css`.
- Equipes usam `team-*`: barrinha vertical de 4px ao lado do nome, faixa de 4px no topo dos cards e a linha no gráfico. Equipe nova sem cor cadastrada cai em `team-other`.

## Tipografia

- Uma família só: Titillium Web (Google Fonts, pesos 400, 600, 700 e 900), em `--font-sans`. O peso 900 é a voz da marca: títulos, nomes e números.
- Títulos em caixa alta e entrelinha justa: `page-title` (30px no celular, 48px a partir de 640px), `section-title`, `card-title`, `hero-name`.
- Números de destaque em `stat-hero` e `stat`, com algarismos proporcionais. Em colunas de tabela, use algarismos tabulares (`font-variant-numeric: tabular-nums`, classe `.tabular`) para os números alinharem.
- Rótulos (`eyebrow`, `label`, `table-head`, `badge`) sempre em caixa alta com espaçamento entre letras.
- Texto de tabela em `table` (14px); o nome do piloto na primeira coluna em `table-name` (16px, 700).

## Espaço e layout

- Conteúdo centralizado com largura máxima `content-max` e margem lateral `space-4`. Entre seções, `space-10`; abaixo do título de página, `space-8`.
- Grades de cards com gap `space-4`. Padding: `space-4` em StatTile, `space-5` em cards de pódio, equipe e Superlicença, `space-6` nos cards de destaque.
- Células de tabela com `space-3` de padding; a primeira e a última coluna ganham `space-4` de respiro na borda.
- No celular tudo empilha numa coluna. Tabelas largas rolam na horizontal dentro do próprio card (mínimo de 560px); a página nunca rola para o lado.

## Formas e superfícies

- Cards com `radius-xl` e borda em `line`; nada de sombra para separar cards. A única sombra é `shadow-tooltip`.
- Controles de escolha (temporada, Sprint/Corrida, chips de piloto, botão de tema) são pílulas com `radius-full` e borda em `line`; o item ativo inverte para fundo `text` e texto `bg`.
- Selos (Sprint, VMR) com `radius-sm`; células do resumo da temporada com `radius-md`.
- Cards de destaque (líder, pódio, equipes) levam a textura `stripe`: traços diagonais a -60°, 2px a cada 8px. Eles marcam o card com uma faixa da cor da equipe (4px), no topo ou à esquerda.
- O logotipo é tipográfico: TILTADOS em `wordmark` e `on-accent` sobre um bloco `accent` inclinado −12°, seguido de F1 em `text-2`. Não existe arquivo de logo próprio da liga.

## Gráficos

- Evolução do campeonato em dois gráficos de linha, "Pontos" e "Posição" (eixo invertido, 1º no topo), com altura `chart-height`, grade em `line` e rótulos em `muted`.
- Até 3 pilotos em destaque, na cor `team-*` da equipe; o resto fica em `series-rest`. O companheiro de equipe atrás na classificação usa linha tracejada (6 4) e a legenda repete o traço.
- O fim de cada linha destacada tem um ponto de 8px com anel `surface` e o nome do piloto com o valor final. O tooltip lista todos os pilotos na ordem daquela etapa.
- A seleção de pilotos é compartilhada entre os dois gráficos da página.

## Iconografia e imagens

- Não há biblioteca de ícones. Os poucos ícones são SVG inline de traço 2px e pontas arredondadas, na cor do texto (sol, lua e monitor no botão de tema). Setas e marcas são caracteres: ▲ ▼ ✓ ! ‼ ⛔ ⏱ →.
- Logos de equipe (grupo Equipes): a versão branca no tema escuro e a colorida no tema claro, trocadas por CSS (`.only-dark` e `.only-light`). Tamanhos usados: 14px sob o nome do piloto, 18 a 20px em tabelas, 24 a 44px em cards. Sempre ao lado do nome da equipe em texto. Equipe sem logo mostra a barrinha `team-*`.
- O ícone do site (grupo Site) é o logo da F1, igual ao do site oficial.

## Acessibilidade

- O anel de foco do gráfico é de 2px em `text-2`, com `radius-lg`.
- Pares que ficam abaixo de 4,5:1 e foram mantidos como estão no código: `accent` como texto no tema escuro (3,81:1 sobre `bg`) e `muted` sobre `surface-2` (4,16 e 4,46).
- Cor nunca é o único sinal: posições ganhas e perdidas têm seta, status têm ícone e rótulo, o companheiro de equipe no gráfico tem tracejado.

## Componentes

- As fichas mostram prévias estáticas fiéis aos componentes React do site, com as mesmas medidas, os tokens reais e dados da temporada 2026. O código de verdade está em `src/components/` e nas páginas indicadas em cada ficha; `components/index.d.ts` traz as propriedades.
- Estrutura (SiteHeader, ThemeToggle, PageTitle, SectionTitle, MoreLink, Card, Table, Skeleton), Dados (Position, Gained, StatTile, TeamBar, TeamLogo, SprintBadge, FastestLapBadge), Classificação, Gráficos e Padrões de página (cards que vivem dentro das páginas).
- A fonte Titillium Web vem do Google Fonts; não há arquivo de fonte neste sistema.

## Arquivos desta pasta

- `tokens.json`: todos os tokens (cores dos dois temas, tipografia, espaços, raios, sombra e medidas), cada um com nota de uso. Os valores de cor espelham `src/app/globals.css`, que é a fonte usada pelo site.
- `tokens.css`: os mesmos tokens como variáveis CSS (`--bg`, `--space-4`…) e uma classe por estilo de texto (`.page-title`, `.eyebrow`…), gerado a partir do `tokens.json`.
- `components/<Nome>/README.md`: guia de cada componente (quando usar, o que fornecer, faça e evite, onde está no código).
- `components/<Nome>/preview.html`: prévia estática do componente, com dados reais de 2026. Abra direto no navegador; `?theme=light` mostra o tema claro.
- `components/index.d.ts`: propriedades dos componentes, copiadas de `src/components/`.
- `components/bundle.css`: estilos compartilhados das prévias.
- `assets/Equipes.md` e `assets/Site.md`: descrição das logos (`public/teams/`) e dos ícones (`src/app/`).
- `index.html`: todas as prévias numa página só, com troca de tema.

Quando uma cor, fonte ou componente mudar no código, atualize esta pasta junto para ela continuar descrevendo o site.
