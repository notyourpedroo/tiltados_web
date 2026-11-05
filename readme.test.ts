import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "vitest";

// CODING_STANDARDS.md, Documentação: todo módulo de src/lib/ aparece na árvore
// "Estrutura" do README.md, com uma linha sobre o que ele faz.

const README = readFileSync(join(__dirname, "README.md"), "utf8");
const tree = /## Estrutura\s+```text\r?\n([\s\S]*?)```/.exec(README)?.[1] ?? "";

test("a árvore Estrutura do README.md lista todo módulo de src/lib/", () => {
  const modules = readdirSync(join(__dirname, "src/lib")).filter(
    (f) => f.endsWith(".ts") && !f.endsWith(".test.ts"),
  );
  const missing = modules.filter((f) => !new RegExp(`[─ ]${f.replace(".", "\\.")}\\s+#`).test(tree));
  expect(missing).toEqual([]);
});
