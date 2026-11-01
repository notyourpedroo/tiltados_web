import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

// Componente novo ou alterado leva a ficha junto (CODING_STANDARDS.md, Design system).
// Este teste confere a parte mecânica: cada componente exportado de src/components/ tem
// ficha (README e prévia) e props em components/index.d.ts, e cada ficha aparece no
// index.html. Se a prévia mostra cada variante continua com a revisão.

const root = join(__dirname, "..");
const read = (path: string) => readFileSync(join(root, path), "utf8");
const fichaFile = (ficha: string, file: string) => `design-system/components/${ficha}/${file}`;
const fichaHas = (ficha: string, file: string) => existsSync(join(root, fichaFile(ficha, file)));

// Peças documentadas dentro da ficha de outro componente, que cita o nome delas.
const PARTS: Record<string, string> = {
  ChanceBadge: "ChanceRow",
  ChanceBar: "ChanceRow",
  TeamMark: "TeamLogo",
  WithTeamCar: "TeamCar",
};
// Sem tela própria: não tem ficha nem props.
const NOT_VISUAL = new Set(["HideOnError"]);

/**
 * Componentes exportados de cada arquivo de src/components/: `export [default] [async]
 * function|const Nome`, com nome que começa em maiúscula (DNFBadge também). Constantes
 * em caixa alta, como KIND_TEXT, ficam de fora.
 */
function exportedComponents(): string[] {
  const dir = join(root, "src/components");
  return readdirSync(dir)
    .filter((file) => file.endsWith(".tsx"))
    .flatMap((file) =>
      [
        ...readFileSync(join(dir, file), "utf8").matchAll(
          /export (?:default )?(?:async )?(?:function|const) ([A-Z]\w*)/g,
        ),
      ].map(([, name]) => name),
    )
    .filter((name) => /[a-z]/.test(name) && !NOT_VISUAL.has(name));
}

const fichas = readdirSync(join(root, "design-system/components"), { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);
const previewIndex = read("design-system/index.html");
const propTypes = read("design-system/components/index.d.ts");

describe("Fichas do design system", () => {
  test.each(exportedComponents())("%s tem ficha e props", (name) => {
    const ficha = PARTS[name] ?? name;
    expect(fichaHas(ficha, "README.md"), `${ficha}/README.md`).toBe(true);
    expect(fichaHas(ficha, "preview.html"), `${ficha}/preview.html`).toBe(true);
    if (PARTS[name]) expect(read(fichaFile(ficha, "README.md"))).toContain(name);
    expect(propTypes, `${name}Props em components/index.d.ts`).toMatch(new RegExp(`\\b${name}Props\\b`));
  });

  // A altura do iframe no index.html repete a do comentário @dsCard da prévia.
  test.each(fichas)("%s aparece no index.html", (ficha) => {
    const height = read(fichaFile(ficha, "preview.html")).match(/@dsCard[^>]*height=(\d+)/)?.[1];
    expect(previewIndex).toContain(
      `title="${ficha}" data-src="components/${ficha}/preview.html" style="height:${height}px"`,
    );
    if (fichaHas(ficha, "README.md")) expect(previewIndex).toContain(`href="components/${ficha}/README.md"`);
  });
});
