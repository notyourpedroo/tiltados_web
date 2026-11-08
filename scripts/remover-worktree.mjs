// Remove worktrees de agentes sem levar junto o node_modules do checkout principal:
// desfaz a junction de node_modules (docs/agents/worktrees.md) e só então roda
// `git worktree remove`. Uma remoção recursiva com a junction no lugar apagaria o
// node_modules que ela aponta.
//
//   node scripts/remover-worktree.mjs <caminho>... [--force]
//   node scripts/remover-worktree.mjs .claude/worktrees/agent-a1b2c3
//
// --force passa ao git: descarta mudanças não commitadas do worktree.
import { existsSync, lstatSync, unlinkSync } from "node:fs";
import path from "node:path";
import { findWorktree, git, main } from "./worktrees.mjs";

const args = process.argv.slice(2);
const force = args.includes("--force");
const targets = args.filter((arg) => arg !== "--force");
if (targets.length === 0) {
  console.error("Uso: node scripts/remover-worktree.mjs <caminho>... [--force]");
  process.exit(1);
}

const mainModules = path.join(main, "node_modules");

let failed = false;
for (const target of targets) {
  const dir = findWorktree(target);
  if (!dir) {
    failed = true;
    continue;
  }
  if (dir === main) {
    console.error(`${target}: é o checkout principal; não removo.`);
    failed = true;
    continue;
  }
  const modules = path.join(dir, "node_modules");
  // lstat não segue o link: uma junction aparece como link, não como pasta.
  if (existsSync(modules) && lstatSync(modules).isSymbolicLink()) unlinkSync(modules);
  try {
    git("worktree", "remove", ...(force ? ["--force"] : []), dir);
    console.log(`Removido: ${dir}`);
  } catch (error) {
    console.error(
      `${dir}: o git recusou a remoção (use --force para descartar mudanças):\n${error.stderr ?? error.message}`,
    );
    failed = true;
  }
}

if (!existsSync(mainModules)) {
  console.error(`\nO ${mainModules} sumiu: rode \`npm ci\` no checkout principal.`);
  failed = true;
}
process.exit(failed ? 1 : 0);
