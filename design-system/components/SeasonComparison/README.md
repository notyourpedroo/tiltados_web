# SeasonComparison

Card que compara as médias por Sessão do piloto na temporada atual até agora com as Temporadas anteriores inteiras. Nunca totais, para que calendários de tamanhos diferentes não enganem.

## Composição
- Rótulo em `label`: "Comparativo".
- Tabela de 14px com cinco linhas: pontos por sessão, vitórias em corridas (% das Corridas disputadas), pódios (% das Sessões disputadas), chegada média (em Corridas) e Ritmo. Colunas: uma por Temporada anterior em que o piloto disputou Sessão, em ordem cronológica e em `text-2`; a atual por último, em 900; e a evolução.
- Evolução em `caption` e `text-2`, sempre escrita: "▲ melhor", "▼ pior" ou "= igual", comparando a temporada atual com a Temporada anterior mais recente que o piloto disputou, pelos valores como aparecem na tela. Na chegada média e no Ritmo, menor é melhor. Sem cor: `gain` e `loss` ficam só para posições ganhas e perdidas.
- Média sem valor (sem Corrida disputada, sem tempo válido) mostra "—" e fica sem evolução.
- Nota em `caption` e `muted`. Com uma Temporada anterior: "2026 até agora contra 2025 inteira, sempre por sessão disputada". Com mais de uma: "2027 até agora; temporadas anteriores inteiras, sempre por sessão disputada".

## Onde aparece
- Perfil do piloto, depois das Sequências, na largura toda, alinhado ao card de Chance de título logo abaixo. Só para quem tem Sessão disputada na temporada atual e em alguma Temporada anterior, pelo mesmo ID; some para o estreante, para quem ainda não correu a temporada atual e em 2025, que não tem Temporada anterior no site.

Fonte: `src/components/SeasonComparison.tsx` e `seasonComparison` em `src/lib/driver-season.ts`, usado em `src/app/[season]/pilotos/[driverId]/page.tsx` · prévia estática com o Paulo em 2026 (até R18) contra 2025, que mostra as três evoluções, e um piloto que em 2026 só correu Sprints e em 2025 não marcou tempo, com "—" sem evolução, e uma de duas Temporadas anteriores (2025 e 2026 contra 2027), com a evolução contra 2026 e a nota de várias temporadas.
