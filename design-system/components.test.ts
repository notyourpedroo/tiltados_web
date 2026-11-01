import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

// Componente novo ou alterado leva a ficha junto (CODING_STANDARDS.md, Design system).
// Este teste confere a parte mecânica: cada componente exportado de src/components/ tem
// ficha (README e prévia) e props em components/index.d.ts, e cada ficha aparece no
// index.html. Se a prévia mostra cada variante continua com a revisão.

const root = join(__dirname, "..");
const read = (path: string) => readFileSync(join(root, path), "utf8");

// Peças documentadas dentro da ficha de outro componente, que cita o nome delas.
const PARTS: Record<string, string> = {
  ChanceBadge: "ChanceRow",
  ChanceBar: "ChanceRow",
  TeamMark: "TeamLogo",
  WithTeamCar: "TeamCar",
};
// Sem tela própria: não tem ficha nem props.
const NOT_VISUAL = new Set(["HideOnError"]);

/** Componentes exportados (nome em PascalCase) de cada arquivo de src/components/. */
function exportedComponents(): string[] {
  const dir = join(root, "src/components");
  return readdirSync(dir)
    .filter((file) => file.endsWith(".tsx"))
    .flatMap((file) =>
      [...readFileSync(join(dir, file), "utf8").matchAll(/export (?:function|const) ([A-Z][a-z]\w*)/g)].map(
        ([, name]) => name,
      ),
    )
    .filter((name) => !NOT_VISUAL.has(name));
}

const fichas = readdirSync(join(root, "design-system/components"), { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);
const index = read("design-system/index.html");
const types = read("design-system/components/index.d.ts");

describe("Fichas do design system", () => {
  test.each(exportedComponents())("%s tem ficha e props", (name) => {
    const ficha = PARTS[name] ?? name;
    expect(existsSync(join(root, `design-system/components/${ficha}/README.md`)), `${ficha}/README.md`).toBe(true);
    expect(existsSync(join(root, `design-system/components/${ficha}/preview.html`)), `${ficha}/preview.html`).toBe(
      true,
    );
    if (PARTS[name]) expect(read(`design-system/components/${ficha}/README.md`)).toContain(name);
    expect(types, `${name}Props em components/index.d.ts`).toMatch(new RegExp(`\\b${name}Props\\b`));
  });

  // A altura do iframe no index.html repete a do comentário @dsCard da prévia.
  test.each(fichas)("%s aparece no index.html", (ficha) => {
    const height = read(`design-system/components/${ficha}/preview.html`).match(/@dsCard[^>]*height=(\d+)/)?.[1];
    expect(index).toContain(`title="${ficha}" data-src="components/${ficha}/preview.html" style="height:${height}px"`);
    if (existsSync(join(root, `design-system/components/${ficha}/README.md`))) {
      expect(index).toContain(`href="components/${ficha}/README.md"`);
    }
  });
});
