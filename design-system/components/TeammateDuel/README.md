# TeammateDuel

Card do perfil do piloto com o placar de quem chegou na frente entre companheiros de equipe.

## Composição
- Rótulo "Duelo com companheiro de equipe" em `label`; placar em 18px 900 ("Matheus 17 × 2 Gabriel"), o companheiro como link.
- Barra de 8px dividida: a parte do piloto em `text`, o resto em `surface-2`, separadas por 2px.
- Nota em `caption`: "Quem chegou na frente, em 19 sessões juntos". Conta só as sessões em que os dois correram pela mesma equipe.

Fonte: `src/app/[season]/pilotos/[driverId]/page.tsx` · prévia estática com os dados de 2026.
