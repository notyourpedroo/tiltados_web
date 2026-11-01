// Capturas de tela para o PR: cada rota no desktop e no celular, nos temas claro e
// escuro, com o Chrome headless. Com --pr, publica as PNGs num branch órfão
// capturas/pr-<n> (sem checkout, fora da main) e imprime o markdown para o corpo do PR.
//
//   node scripts/capturas.mjs <pasta> [--pr <n>] <rota>...
//   node scripts/capturas.mjs capturas --pr 42 2026 2026/pilotos/2 2026/titulo
//
// As rotas vão sem a barra inicial: no Git Bash, "/2026" vira "C:/Program Files/Git/2026".
// Variáveis: CAPTURAS_BASE (padrão http://localhost:3000, o site rodando) e CHROME
// (padrão o Chrome instalado no Windows). O site precisa estar de pé antes.
import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync } from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const prFlag = args.indexOf("--pr");
const pr = prFlag === -1 ? undefined : args.splice(prFlag, 2)[1];
const [outDir, ...routes] = args;
if (!outDir || routes.length === 0 || (prFlag !== -1 && !pr)) {
  console.error("Uso: node scripts/capturas.mjs <pasta> [--pr <n>] <rota>...");
  process.exit(1);
}
const base = (process.env.CAPTURAS_BASE ?? "http://localhost:3000").replace(/\/+$/, "");
const chrome = process.env.CHROME ?? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

// O Chrome headless não desenha abaixo de ~500 px de largura (a captura sai cortada),
// e 500 px ainda fica abaixo do breakpoint sm (640 px), no layout de celular.
const SIZES = { desktop: "1280,1000", celular: "500,1700" };
// Sem forçar, o headless herda o tema do sistema e o "claro" sai escuro.
const THEMES = {
  claro: ["--blink-settings=preferredColorScheme=1"],
  escuro: ["--force-dark-mode", "--blink-settings=preferredColorScheme=0"],
};

mkdirSync(outDir, { recursive: true });
for (const route of routes) {
  const name = route.replace(/^\/+|\/+$/g, "").replaceAll("/", "-") || "inicio";
  const url = `${base}/${route.replace(/^\/+/, "")}`;
  for (const [size, windowSize] of Object.entries(SIZES)) {
    for (const [theme, themeFlags] of Object.entries(THEMES)) {
      const file = path.resolve(outDir, `${name}-${size}-${theme}.png`);
      execFileSync(chrome, [
        "--headless=new",
        "--disable-gpu",
        "--hide-scrollbars",
        "--force-device-scale-factor=2",
        `--window-size=${windowSize}`,
        "--virtual-time-budget=8000",
        ...themeFlags,
        `--screenshot=${file}`,
        url,
      ], { stdio: "ignore" });
      console.log(file);
    }
  }
}

if (pr) publish(pr);

// Monta o commit órfão direto no banco do git e o publica em capturas/pr-<n>.
// Um push novo para o mesmo PR troca as capturas de uma vez.
function publish(prNumber) {
  const git = (...gitArgs) => execFileSync("git", gitArgs, { encoding: "utf8" }).trim();
  const pngs = readdirSync(outDir).filter((file) => file.endsWith(".png")).sort();
  const tree = execFileSync("git", ["mktree"], {
    encoding: "utf8",
    input: pngs
      .map((file) => `100644 blob ${git("hash-object", "-w", path.join(outDir, file))}\t${file}`)
      .join("\n") + "\n",
  }).trim();
  const commit = git("commit-tree", tree, "-m", `docs(capturas): capturas de tela do PR #${prNumber}`);
  const branch = `capturas/pr-${prNumber}`;
  git("push", "--force", "origin", `${commit}:refs/heads/${branch}`);

  const repo = git("remote", "get-url", "origin").replace(/^.*github\.com[:/]/, "").replace(/\.git$/, "");
  console.log(`\nPublicadas em ${branch}. Markdown para o corpo do PR:\n`);
  for (const file of pngs) {
    console.log(`![${file.replace(/\.png$/, "")}](https://github.com/${repo}/blob/${branch}/${file}?raw=true)`);
  }
}
