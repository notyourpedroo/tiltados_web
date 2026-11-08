// Grava um retrato das Sessões e dos resultados reais da API para o teste de sanidade
// (src/lib/real-seasons.test.ts), no formato { "/rota": resposta } das fixtures do
// mock-api.mjs. Refaça quando a API mudar de formato ou a temporada andar:
//
//   node scripts/retrato-api.mjs 2025 2026
//
// Com --check, não grava: compara o retrato salvo com a API e sai com código 1
// apontando a rota que divergiu (o workflow retrato.yml roda assim para 2025).
//
// O endereço vem de TILTADOS_API_URL ou do .env.local.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { getApi } from "./api-url.mjs";

const args = process.argv.slice(2);
const check = args.includes("--check");
const seasons = args.filter((a) => a !== "--check");
if (seasons.length === 0) {
  console.error("Uso: node scripts/retrato-api.mjs [--check] <ano>...");
  process.exit(1);
}

let diverged = false;
for (const season of seasons) {
  const fixture = {};
  for (const route of [`/load/${season}/races`, `/load/${season}/results`]) {
    fixture[route] = await getApi(route);
  }
  const path = `scripts/fixtures/retrato-${season}.json`;
  const summary = `${fixture[`/load/${season}/races`].length} Sessões, ${fixture[`/load/${season}/results`].length} resultados`;

  if (!check) {
    writeFileSync(path, JSON.stringify(fixture, null, 2) + "\n");
    console.log(`${path}: ${summary}`);
    continue;
  }

  if (!existsSync(path)) {
    diverged = true;
    console.error(`${path}: não existe. Grave com node scripts/retrato-api.mjs ${season}.`);
    continue;
  }
  const saved = JSON.parse(readFileSync(path, "utf8"));
  const stale = Object.keys(fixture).filter(
    (route) => JSON.stringify(saved[route]) !== JSON.stringify(fixture[route]),
  );
  for (const route of stale) {
    diverged = true;
    const savedRows = saved[route]?.length ?? 0;
    const apiRows = fixture[route].length;
    const how =
      savedRows === apiRows
        ? `mesmas ${apiRows} linhas, conteúdo diferente`
        : `${savedRows} → ${apiRows} linhas`;
    console.error(
      `${path}: ${route} diverge da API (${how}). Refaça com node scripts/retrato-api.mjs ${season}.`,
    );
  }
  if (stale.length === 0) console.log(`${path}: igual à API (${summary})`);
}
// exitCode, não exit(): sair à força logo depois do fetch derruba o Node no Windows.
if (diverged) process.exitCode = 1;
