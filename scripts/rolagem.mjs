// Rolagem horizontal: abre cada rota em várias larguras no Chrome headless e falha
// quando a página fica mais larga que a janela, apontando o elemento que estoura.
// Sem rotas, percorre o site inteiro a partir de /2025 e /2026 (perfis, Etapas...).
//
//   node scripts/rolagem.mjs [rota]...
//   node scripts/rolagem.mjs 2025/equipes/5 2026/pilotos/5
//
// As rotas vão sem a barra inicial (no Git Bash, "/2026" vira um caminho do Windows).
// Variáveis: CAPTURAS_BASE (padrão http://localhost:3000, o site rodando) e CHROME
// (padrão o Chrome instalado no Windows), as mesmas do capturas.mjs.
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const base = (process.env.CAPTURAS_BASE ?? "http://localhost:3000").replace(/\/+$/, "");
const chrome = process.env.CHROME ?? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
// O celular, a borda do breakpoint sm (640 px) e as larguras em que o desktop aperta.
const WIDTHS = [375, 640, 768, 1024, 1280];
const PARALLEL = 4;

const given = process.argv.slice(2).map((route) => route.replace(/^\/+|\/+$/g, ""));
const crawl = given.length === 0;
const queue = crawl ? ["2025", "2026"] : given;
const seen = new Set(queue);

const profile = mkdtempSync(path.join(tmpdir(), "rolagem-"));
const browser = spawn(chrome, [
  "--headless=new",
  "--disable-gpu",
  "--hide-scrollbars",
  "--remote-debugging-port=0",
  `--user-data-dir=${profile}`,
  "about:blank",
]);
const wsUrl = await new Promise((resolve, reject) => {
  let err = "";
  browser.stderr.on("data", (chunk) => {
    err += chunk;
    const match = err.match(/DevTools listening on (ws:\S+)/);
    if (match) resolve(match[1]);
  });
  browser.on("exit", () => reject(new Error(`O Chrome fechou antes de abrir o DevTools:\n${err}`)));
});

const ws = new WebSocket(wsUrl);
await new Promise((resolve) => ws.addEventListener("open", resolve, { once: true }));
let nextId = 0;
const pending = new Map();
const listeners = new Set();
ws.addEventListener("message", ({ data }) => {
  const msg = JSON.parse(data);
  if (msg.id !== undefined) {
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    if (msg.error) reject(new Error(msg.error.message));
    else resolve(msg.result);
  } else {
    for (const listener of listeners) listener(msg);
  }
});
const send = (method, params = {}, sessionId) =>
  new Promise((resolve, reject) => {
    const id = nextId++;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params, sessionId }));
  });

// Mede depois das fontes: a Titillium muda a largura dos títulos.
const MEASURE = `(async () => {
  await document.fonts.ready;
  const root = document.documentElement;
  const limit = root.clientWidth;
  const overflow = root.scrollWidth - limit;
  let culprit = "";
  if (overflow > 0) {
    const wide = [...document.body.querySelectorAll("*")].filter(
      (el) => el.getBoundingClientRect().right > limit + 1,
    );
    // O culpado é o primeiro que estoura dentro de um pai que cabe na janela.
    const el = wide.find((w) => !wide.includes(w.parentElement)) ?? wide[0];
    if (el) culprit = (el.tagName.toLowerCase() + " " + (el.getAttribute("class") ?? "")).trim().slice(0, 100);
  }
  const links = [...document.querySelectorAll("a[href^='/']")].map((a) => a.getAttribute("href"));
  return { overflow, culprit, links };
})()`;

async function check(route) {
  const { targetId } = await send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
  await send("Page.enable", {}, sessionId);
  // Com abas em paralelo, a de fundo adia a fonte e mede o título estreito demais.
  await send("Emulation.setFocusEmulationEnabled", { enabled: true }, sessionId);
  const failures = [];
  for (const width of WIDTHS) {
    await send(
      "Emulation.setDeviceMetricsOverride",
      { width, height: 900, deviceScaleFactor: 1, mobile: width < 640 },
      sessionId,
    );
    const loaded = new Promise((resolve) => {
      const listener = (msg) => {
        if (msg.sessionId === sessionId && msg.method === "Page.loadEventFired") {
          listeners.delete(listener);
          resolve();
        }
      };
      listeners.add(listener);
    });
    await send("Page.navigate", { url: `${base}/${route}` }, sessionId);
    await loaded;
    const { result } = await send(
      "Runtime.evaluate",
      { expression: MEASURE, awaitPromise: true, returnByValue: true },
      sessionId,
    );
    const { overflow, culprit, links } = result.value;
    if (overflow > 0) failures.push(`/${route} em ${width}px: +${overflow}px (${culprit || "?"})`);
    if (crawl && width === WIDTHS[0]) {
      for (const href of links) {
        const next = href.split(/[?#]/)[0].replace(/^\/+|\/+$/g, "");
        if (/^20\d\d(\/|$)/.test(next) && !seen.has(next)) {
          seen.add(next);
          queue.push(next);
        }
      }
    }
  }
  await send("Target.closeTarget", { targetId });
  return failures;
}

const failures = [];
let checked = 0;
let active = 0;
await new Promise((resolve, reject) => {
  const pump = () => {
    if (queue.length === 0 && active === 0) return resolve();
    while (active < PARALLEL && queue.length > 0) {
      const route = queue.shift();
      active++;
      check(route)
        .then((found) => {
          failures.push(...found);
          checked++;
          active--;
          pump();
        })
        .catch(reject);
    }
  };
  pump();
});

ws.close();
browser.kill();
try {
  rmSync(profile, { recursive: true, force: true });
} catch {}

if (failures.length) {
  console.error(`Rolagem horizontal em ${failures.length} caso(s), de ${checked} rota(s) × ${WIDTHS.length} larguras:\n`);
  for (const failure of failures.sort()) console.error(`  ${failure}`);
  process.exit(1);
}
console.log(`Sem rolagem horizontal: ${checked} rota(s) × ${WIDTHS.length} larguras (${WIDTHS.join(", ")} px).`);
