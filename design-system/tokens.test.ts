import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

// As cores existem em três cópias: tokens.json (fonte do design system), tokens.css
// (as mesmas variáveis para as prévias) e src/app/globals.css (a fonte usada pelo site).
// Este teste confere que as três dizem o mesmo valor, tema por tema.

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
