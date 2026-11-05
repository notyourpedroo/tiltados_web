// Grava um retrato das Sessões e dos resultados reais da API para o teste de sanidade
// (src/lib/real-seasons.test.ts), no formato { "/rota": resposta } das fixtures do
// mock-api.mjs. Refaça quando a API mudar de formato ou a temporada andar:
//
//   node scripts/retrato-api.mjs 2025 2026
//
// O endereço vem de TILTADOS_API_URL ou do .env.local.
import { existsSync, readFileSync, writeFileSync } from "node:fs";

function apiUrl() {
  if (process.env.TILTADOS_API_URL) return process.env.TILTADOS_API_URL;
  if (existsSync(".env.local")) {
    const line = readFileSync(".env.local", "utf8")
      .split(/\r?\n/)
      .find((l) => l.startsWith("TILTADOS_API_URL="));
    if (line) return line.slice("TILTADOS_API_URL=".length).trim();
  }
  throw new Error("TILTADOS_API_URL não definida (nem no ambiente, nem no .env.local).");
}

const seasons = process.argv.slice(2);
if (seasons.length === 0) {
  console.error("Uso: node scripts/retrato-api.mjs <ano>...");
  process.exit(1);
}
const base = apiUrl().replace(/\/+$/, "");

for (const season of seasons) {
  const fixture = {};
  for (const route of [`/load/${season}/races`, `/load/${season}/results`]) {
    const res = await fetch(base + route, { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(`${route}: HTTP ${res.status}`);
    fixture[route] = await res.json();
  }
  const path = `scripts/fixtures/retrato-${season}.json`;
  writeFileSync(path, JSON.stringify(fixture, null, 2) + "\n");
  console.log(`${path}: ${fixture[`/load/${season}/races`].length} Sessões, ${fixture[`/load/${season}/results`].length} resultados`);
}
