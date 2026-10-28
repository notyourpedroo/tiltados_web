// API simulada para ver no site estados que ainda não aconteceram (piloto Suspenso,
// Campeão antes da última Sessão...). Repassa toda chamada para a API de verdade e
// responde com o JSON da fixture nas rotas que ela lista.
//
//   node scripts/mock-api.mjs scripts/fixtures/superlicenca-suspensoes.json
//
// A fixture é um objeto { "/rota": resposta }. Variáveis: MOCK_UPSTREAM (padrão
// http://127.0.0.1:8000, a API local) e MOCK_PORT (padrão 8010). Depois aponte o site:
// TILTADOS_API_URL=http://127.0.0.1:8010.
import { readFileSync } from "node:fs";
import http from "node:http";

const fixturePath = process.argv[2];
if (!fixturePath) {
  console.error("Uso: node scripts/mock-api.mjs <fixture.json>");
  process.exit(1);
}
const fixture = JSON.parse(readFileSync(fixturePath, "utf8"));
const upstream = (process.env.MOCK_UPSTREAM ?? "http://127.0.0.1:8000").replace(/\/+$/, "");
const port = Number(process.env.MOCK_PORT ?? 8010);

http
  .createServer(async (req, res) => {
    if (Object.hasOwn(fixture, req.url)) {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(fixture[req.url]));
      return;
    }
    try {
      const answer = await fetch(upstream + req.url, { headers: { Accept: "application/json" } });
      res.writeHead(answer.status, { "Content-Type": "application/json" });
      res.end(await answer.text());
    } catch (error) {
      res.writeHead(502, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ detail: `API em ${upstream} não respondeu: ${error.cause?.code ?? error.message}` }));
    }
  })
  .listen(port, "127.0.0.1", () => {
    console.log(`API simulada em http://127.0.0.1:${port} (repasse para ${upstream})`);
    console.log(`Rotas da fixture: ${Object.keys(fixture).join(", ")}`);
  });
