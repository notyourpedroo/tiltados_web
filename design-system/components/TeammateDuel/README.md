# TeammateDuel

Card com o placar de quem chegou na frente entre dois companheiros de equipe.

## Composição
- Rótulo em `label`; placar em 18px 900 ("Matheus 17 × 2 Gabriel").
- Barra de 8px dividida: a parte do primeiro piloto em `text`, o resto em `surface-2`, separadas por 2px.
- Nota em `caption`: "Quem chegou na frente, em 19 sessões juntos". Conta só as sessões em que os dois correram pela mesma equipe.

## Onde aparece
- Perfil do piloto: "Duelo com companheiro de equipe", um card por companheiro. O piloto do perfil vem primeiro, em texto; o companheiro é link para o perfil dele.
- Perfil da equipe: "Duelo entre companheiros de equipe", um card por par de Pilotos da equipe que correu junto por ela, do par com mais sessões juntos para o com menos. Os dois nomes são links. Par que nunca correu junto não aparece.

Fonte: `src/components/TeammateDuel.tsx`, usado em `src/app/[season]/pilotos/[driverId]/page.tsx` e `src/app/[season]/equipes/[teamId]/page.tsx` · prévia estática com os dados de 2026.
