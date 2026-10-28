# LicenseCard

Card da Superlicença de um piloto: saldo de pontos, medidor e status.

## Composição
- Cabeçalho com TeamBar, nome em 18px 900 e a equipe (logo de 18px e nome curto) à direita.
- Saldo em `stat-hero` com "/ 12" em `muted`.
- Medidor de 8px em `radius-full` (`role="meter"`): barra na cor `status-*` e trilho na mesma cor a 20%.
- Linha de status: círculo de 20px na cor do status com o ícone em `on-fill`, o rótulo em bold e o número de punições à direita. Quando o rótulo longo (Suspensão cumprida) não cabe com a contagem, a contagem desce inteira de linha, ainda à direita.

## Faça
- Status sempre com ícone e rótulo escrito: ✓ Regular (9 a 12), ! Atenção (5 a 8), ‼ Alerta crítico (1 a 4), ⛔ Suspenso (0 ou menos, Suspensão a cumprir), ↩ Suspensão cumprida (0 ou menos, já cumprida).
- Status que o site não conhece aparece neutro: ícone "?", cor `muted` e o texto da API como rótulo, nunca como Regular.
- Plural pelo helper: "1 punição", "2 punições", "sem punições".

Fonte: `src/app/[season]/superlicenca/page.tsx` e `src/lib/license.ts` · prévia estática com os dados de 2026 e um exemplo hipotético de Suspensão, porque ninguém zerou a Superlicença.
