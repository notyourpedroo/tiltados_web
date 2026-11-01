import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { buildIndex, readFichas } from "../scripts/design-system-index.mjs";

// Componente novo ou alterado leva a ficha junto (CODING_STANDARDS.md, Design system).
// Este teste confere a parte mecânica: cada componente exportado de src/components/ tem
// ficha (README e prévia) e props em components/index.d.ts, e o index.html está igual ao
// que o npm run ds:index gera. Se a prévia mostra cada variante continua com a revisão.

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

const fichas = readFichas().map((ficha) => ficha.name);
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

  // As seções de fichas saem dos comentários @dsCard das prévias.
  test("index.html está igual ao gerado (npm run ds:index)", () => {
    expect(previewIndex).toBe(buildIndex(previewIndex));
  });

  // Sem a meta, a emulação de celular desenha a prévia com 980 px e esconde estouros.
  test.each(fichas)("%s tem a meta viewport", (ficha) => {
    expect(read(fichaFile(ficha, "preview.html"))).toContain(
      '<meta name="viewport" content="width=device-width, initial-scale=1">',
    );
  });
});
