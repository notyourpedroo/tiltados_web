// Sobe o `next dev` de um worktree de agente (.claude/worktrees/), para conferir no
// navegador o branch que está nele (docs/agents/worktrees.md). Junta o que o
// worktree precisa: TURBOPACK_ROOT no checkout principal (o Turbopack recusa a
// junction de node_modules sem isso), o .env.local copiado do checkout principal e uma
// porta própria. Sem caminho, usa o worktree de agente com o commit mais recente.
//
//   node scripts/dev-worktree.mjs [caminho] [--port 3005]
//   node scripts/dev-worktree.mjs .claude/worktrees/agent-a1b2c3
import { spawn } from "node:child_process";
import { copyFileSync, existsSync } from "node:fs";
import path from "node:path";
import { findWorktree, git, main, normalize, worktrees } from "./worktrees.mjs";

const usage = "Uso: node scripts/dev-worktree.mjs [caminho] [--port 3005]";
const args = process.argv.slice(2);
let port = "3005";
const paths = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--port") port = args[++i];
  else paths.push(args[i]);
}
if (!/^\d+$/.test(port ?? "") || paths.length > 1) {
  console.error(usage);
  process.exit(1);
}

let dir;
if (paths.length === 1) {
  dir = findWorktree(paths[0]);
  if (!dir) process.exit(1);
} else {
  // Worktree registrado com a pasta já apagada (prunable) fica de fora.
  const agentsRoot = normalize(path.join(main, ".claude", "worktrees")) + path.sep;
  const agents = worktrees
    .filter((w) => normalize(w).startsWith(agentsRoot) && existsSync(w))
    .map((w) => ({ w, committedAt: Number(git("-C", w, "log", "-1", "--format=%ct")) }));
  if (agents.length === 0) {
    console.error("Nenhum worktree de agente em .claude/worktrees/.");
    process.exit(1);
  }
  dir = agents.reduce((newest, a) => (a.committedAt > newest.committedAt ? a : newest)).w;
}

if (!existsSync(path.join(dir, "node_modules"))) {
  console.error(
    `${dir}: sem node_modules. Crie a junction (docs/agents/worktrees.md):\n` +
      `  New-Item -ItemType Junction -Path ${path.join(dir, "node_modules")} -Target ${path.join(main, "node_modules")}`,
  );
  process.exit(1);
}
const env = path.join(dir, ".env.local");
if (!existsSync(env) && existsSync(path.join(main, ".env.local")))
  copyFileSync(path.join(main, ".env.local"), env);

const branch = git("-C", dir, "branch", "--show-current").trim() || "HEAD solto";
console.log(`Worktree ${dir} (${branch}) na porta ${port}`);
// Uma string só: o npm do Windows é um .cmd e precisa do shell; a porta já foi validada.
const dev = spawn(`npm run dev -- --port ${port}`, {
  cwd: dir,
  env: { ...process.env, TURBOPACK_ROOT: main },
  stdio: "inherit",
  shell: true,
});
dev.on("exit", (code) => process.exit(code ?? 1));
