// Imprime a resposta JSON de uma rota da Tiltados API configurada (TILTADOS_API_URL
// ou .env.local), para conferir um dado sem escrever script:
//
//   node scripts/api.mjs load/2025/standings/drivers
//
// No Git Bash, passe a rota sem a barra inicial.
import { getApi } from "./api-url.mjs";

const route = process.argv[2];
if (!route) {
  console.error("Uso: node scripts/api.mjs <rota>   (ex.: load/2025/results)");
  process.exit(1);
}
console.log(JSON.stringify(await getApi(route), null, 2));
