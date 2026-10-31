import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

// As cores existem em três cópias: tokens.json (fonte do design system), tokens.css
// (as mesmas variáveis para as prévias) e src/app/globals.css (a fonte usada pelo site).
// Este teste confere que as três dizem o mesmo valor, tema por tema, e que os pares
// documentados no design system mantêm o contraste mínimo nos dois temas.

type Theme = "dark" | "light";
type Palette = Record<string, string>;

const root = join(__dirname, "..");
const read = (path: string) => readFileSync(join(root, path), "utf8");

/** Variáveis `--nome: valor;` do bloco que começa logo depois do seletor. */
function block(css: string, selector: string): Palette {
  const start = css.indexOf(`${selector} {`);
  if (start < 0) throw new Error(`Seletor não encontrado: ${selector}`);
  const body = css.slice(start + selector.length + 2, css.indexOf("}", start));
  const vars: Palette = {};
  for (const [, name, value] of body
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .matchAll(/--([\w-]+):\s*([^;]+);/g)) {
    vars[name] = value.trim().toLowerCase();
  }
  return vars;
}

function jsonPalette(theme: Theme): Palette {
  const { color } = JSON.parse(read("design-system/tokens.json")) as {
    color: { tokens: { name: string; value: { dark: string; light?: string } }[] };
  };
  // Token só com "dark" vale igual nos dois temas (status, medalhas, on-fill).
  return Object.fromEntries(
    color.tokens.map((t) => [t.name, (t.value[theme] ?? t.value.dark).toLowerCase()]),
  );
}

const globals = read("src/app/globals.css");
const tokensCss = read("design-system/tokens.css");

/** Só as variáveis de cor: tokens.css também traz a sombra no bloco do tema escuro. */
function colors(palette: Palette): Palette {
  const names = new Set(Object.keys(jsonPalette("dark")));
  return Object.fromEntries(Object.entries(palette).filter(([name]) => names.has(name)));
}

const sources: Record<Theme, Record<string, Palette>> = {
  dark: {
    "globals.css": block(globals, ":root"),
    "tokens.css": colors(block(tokensCss, ':root, [data-theme="dark"]')),
  },
  light: {
    "globals.css (prefers-color-scheme)": block(globals, ':root:not([data-theme="dark"])'),
    "globals.css (botão de tema)": block(globals, ':root[data-theme="light"]'),
    "tokens.css": block(tokensCss, '[data-theme="light"]'),
  },
};

describe("Tokens de cor", () => {
  for (const theme of ["dark", "light"] as const) {
    for (const [file, palette] of Object.entries(sources[theme])) {
      test(`${file} no tema ${theme} bate com tokens.json`, () => {
        const json = jsonPalette(theme);
        // No tema claro, globals.css só redefine o que muda; o resto vem do tema escuro.
        const expected =
          file.startsWith("globals.css") && theme === "light"
            ? Object.fromEntries(Object.entries(json).filter(([name]) => json[name] !== jsonPalette("dark")[name]))
            : json;
        expect(palette).toEqual(expected);
      });
    }
  }
});

/** Razão de contraste WCAG 2 entre duas cores `#rrggbb`. */
function contrast(fg: string, bg: string): number {
  const luminance = (hex: string) => {
    const [r, g, b] = [1, 3, 5].map((i) => {
      const c = parseInt(hex.slice(i, i + 2), 16) / 255;
      return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const [hi, lo] = [luminance(fg), luminance(bg)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

// Mínimos do design system (README, seção Acessibilidade). Ficam fora da lista os pares
// documentados abaixo de 4,5:1: muted e os textos coloridos sobre surface-2 (hover).
// accent como texto no tema escuro entra na lista, mas como exceção explícita.
const neutrals = ["bg", "surface", "surface-2"];
const teams = Object.keys(jsonPalette("dark")).filter((name) => name.startsWith("team-"));
const minimums: { fg: string; bg: string; min: number }[] = [
  ...neutrals.map((bg) => ({ fg: "text", bg, min: 12 })),
  ...neutrals.map((bg) => ({ fg: "text-2", bg, min: 7 })),
  ...["bg", "surface"].map((bg) => ({ fg: "muted", bg, min: 4.5 })),
  // Texto colorido direto no fundo da página e no card: sobretítulos, "Líder do
  // campeonato", "Título decidido".
  ...["accent", "gold"].flatMap((fg) => ["bg", "surface"].map((bg) => ({ fg, bg, min: 4.5 }))),
  // Cores de equipe são linhas e marcas, não texto.
  ...teams.map((fg) => ({ fg, bg: "surface", min: 3 })),
  // Linhas sem destaque: só precisam aparecer, sem competir com as destacadas.
  { fg: "series-rest", bg: "surface", min: 1.5 },
];

/** Pares abaixo do mínimo mantidos de propósito, documentados no README (Acessibilidade). */
const exceptions: Record<Theme, string[]> = {
  // accent como texto: 3,81:1 sobre bg e 3,40:1 sobre surface; só em sobretítulos curtos.
  dark: ["accent sobre bg", "accent sobre surface"],
  light: [],
};

describe("Contraste dos tokens de cor", () => {
  test("a razão segue a fórmula WCAG", () => {
    expect(contrast("#000000", "#ffffff")).toBeCloseTo(21, 2);
    expect(contrast("#ffffff", "#000000")).toBeCloseTo(21, 2);
    expect(contrast("#777777", "#ffffff")).toBeCloseTo(4.48, 2);
  });

  for (const theme of ["dark", "light"] as const) {
    for (const { fg, bg, min } of minimums) {
      const known = exceptions[theme].includes(`${fg} sobre ${bg}`);
      test.skipIf(known)(`${fg} sobre ${bg} no tema ${theme} tem ${String(min).replace(".", ",")}:1 ou mais`, () => {
        const palette = jsonPalette(theme);
        expect(contrast(palette[fg], palette[bg])).toBeGreaterThanOrEqual(min);
      });
    }
  }
});
