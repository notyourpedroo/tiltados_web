// Worktrees deste repositório, para os scripts que mexem neles (remover-worktree.mjs,
// dev-worktree.mjs).
import { execFileSync } from "node:child_process";
import path from "node:path";

export const git = (...gitArgs) =>
  execFileSync("git", gitArgs, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });

export const normalize = (p) => path.resolve(p).toLowerCase();

// A primeira entrada do `git worktree list` é o checkout principal.
export const worktrees = git("worktree", "list", "--porcelain")
  .split("\n")
  .filter((line) => line.startsWith("worktree "))
  .map((line) => line.slice("worktree ".length));

export const main = worktrees[0];

/** O worktree registrado no caminho dado, ou undefined com o erro já impresso. */
export function findWorktree(target) {
  const dir = worktrees.find((w) => normalize(w) === normalize(target));
  if (!dir) console.error(`${target}: não é um worktree deste repositório.`);
  return dir;
}
