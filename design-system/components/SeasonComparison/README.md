# SeasonComparison

Card que compara as médias por Sessão do piloto na temporada atual até agora com a Temporada passada inteira. Nunca totais, para que calendários de tamanhos diferentes não enganem.

## Composição
- Rótulo em `label`: "Comparativo".
- Tabela de 14px com cinco linhas: pontos por sessão, vitórias em corridas (% das Corridas disputadas), pódios (% das Sessões disputadas), chegada média (em Corridas) e Ritmo. Colunas: a Temporada passada em `text-2`, a atual em 900 e a evolução.
- Evolução em `caption` e `text-2`, sempre escrita: "▲ melhor", "▼ pior" ou "= igual", comparando os valores como aparecem na tela. Na chegada média e no Ritmo, menor é melhor. Sem cor: `gain` e `loss` ficam só para posições ganhas e perdidas.
- Média sem valor (sem Corrida disputada, sem tempo válido) mostra "—" e fica sem evolução.
- Nota em `caption` e `muted`: "2026 até agora contra 2025 inteira, sempre por sessão disputada".

## Onde aparece
- Perfil do piloto, depois das Sequências, na largura toda, alinhado ao card de Chance de título logo abaixo. Só para quem tem Sessão disputada nas duas temporadas, pelo mesmo ID; some para o estreante, para quem ainda não correu a temporada atual e em 2025, que não tem temporada anterior no site.

Fonte: `src/components/SeasonComparison.tsx` e `seasonComparison` em `src/lib/driver-season.ts`, usado em `src/app/[season]/pilotos/[driverId]/page.tsx` · prévia estática com o Paulo em 2026 (até R18) contra 2025, que mostra as três evoluções, e um piloto que em 2026 só correu Sprints e em 2025 não marcou tempo, com "—" sem evolução.
