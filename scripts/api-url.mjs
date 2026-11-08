// Endereço da Tiltados API para os scripts: TILTADOS_API_URL ou a linha do .env.local.
import { existsSync, readFileSync } from "node:fs";

function apiUrl() {
  let url = process.env.TILTADOS_API_URL;
  if (!url && existsSync(".env.local")) {
    const line = readFileSync(".env.local", "utf8")
      .split(/\r?\n/)
      .find((l) => l.startsWith("TILTADOS_API_URL="));
    if (line) url = line.slice("TILTADOS_API_URL=".length).trim();
  }
  if (!url) throw new Error("TILTADOS_API_URL não definida (nem no ambiente, nem no .env.local).");
  return url.replace(/^["']|["']$/g, "").replace(/\/+$/, "");
}

/** Resposta JSON de uma rota da API (com ou sem a barra inicial). */
export async function getApi(route) {
  const path = "/" + route.replace(/^\/+/, "");
  const get = () => fetch(apiUrl() + path, { headers: { Accept: "application/json" } });
  let res = await get();
  // A API às vezes pisca (502, 429, como na rolagem.mjs): tenta de novo antes de acusar.
  if (res.status >= 500 || res.status === 429) {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    res = await get();
  }
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
  return res.json();
}
