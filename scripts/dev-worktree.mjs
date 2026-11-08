// Sobe o `next dev` de um worktree de agente (.claude/worktrees/), para conferir no
// navegador o branch que está nele (docs/agents/worktrees.md). Junta o que o
// worktree precisa: TURBOPACK_ROOT no checkout principal (o Turbopack recusa a
// junction de node_modules sem isso), o .env.local copiado do checkout principal e uma
// porta própria. Sem caminho, usa o worktree de agente com o commit mais recente.
//
//   node scripts/dev-worktree.mjs [caminho] [--port 3005]
//   node scripts/dev-worktree.mjs .claude/worktrees/agent-a1b2c3
import { execFileSync, spawn } from "node:child_process";
import { copyFileSync, existsSync } from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const portIndex = args.indexOf("--port");
const port = portIndex >= 0 ? args[portIndex + 1] : "3005";
const given = args.filter((_, i) => i !== portIndex && i !== portIndex + 1)[0];

const git = (...gitArgs) =>
  execFileSync("git", gitArgs, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
const normalize = (p) => path.resolve(p).toLowerCase();
// A primeira entrada do `git worktree list` é o checkout principal.
const worktrees = git("worktree", "list", "--porcelain")
  .split("\n")
  .filter((line) => line.startsWith("worktree "))
  .map((line) => line.slice("worktree ".length));
const main = worktrees[0];
const agents = worktrees.filter((w) =>
  normalize(w).startsWith(normalize(path.join(main, ".claude", "worktrees"))),
);

let dir;
if (given) {
  dir = worktrees.find((w) => normalize(w) === normalize(given));
  if (!dir) {
    console.error(`${given}: não é um worktree deste repositório.`);
    process.exit(1);
  }
} else {
  if (agents.length === 0) {
    console.error("Nenhum worktree de agente em .claude/worktrees/.");
    process.exit(1);
  }
  const committedAt = (w) => Number(git("-C", w, "log", "-1", "--format=%ct"));
  dir = agents.reduce((newest, w) => (committedAt(w) > committedAt(newest) ? w : newest));
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

console.log(
  `Worktree ${dir} (${git("-C", dir, "branch", "--show-current") || "HEAD solto"}) na porta ${port}`,
);
const dev = spawn("npm", ["run", "dev", "--", "--port", port], {
  cwd: dir,
  env: { ...process.env, TURBOPACK_ROOT: main },
  stdio: "inherit",
  shell: true,
});
dev.on("exit", (code) => process.exit(code ?? 0));
