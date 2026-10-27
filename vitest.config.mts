import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Worktrees de agentes ficam em .claude/worktrees, com cópias dos testes.
    exclude: [...configDefaults.exclude, ".claude/**"],
  },
});
