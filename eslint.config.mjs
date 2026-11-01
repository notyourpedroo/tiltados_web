import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// Mudou uma regex abaixo? Acrescente o caso que ela deve barrar e o que deve deixar
// passar na tabela do eslint.test.ts.
// Regras de cor do design system (design-system/README.md, seção Cor) que dá para
// conferir no texto das classes Tailwind e dos estilos.
const colorRule = (selectorFor, message) => [
  { selector: `Literal[value=${selectorFor}]`, message },
  { selector: `TemplateElement[value.raw=${selectorFor}]`, message },
];
const HEX = colorRule(
  "/#[0-9a-fA-F]{3,8}\\b/",
  "Cor em hex fora de globals.css: use um token (design-system/README.md, Cor).",
);
const MUTED_ON_SURFACE_2 = colorRule(
  "/(?=.*\\bbg-surface-2\\b)(?=.*\\btext-muted\\b)/",
  "text-muted sobre bg-surface-2 fica abaixo de 4,5:1: use text-text-2 (design-system/README.md, Cor).",
);
const ACCENT_FILL = colorRule(
  "/\\bbg-accent\\b/",
  "bg-accent é só da faixa do topo e do bloco do logotipo, no SiteHeader (design-system/README.md, Cor).",
);

// Termos _Avoid_ do GLOSSARY.md que nunca têm outro sentido nos textos da tela. Os
// ambíguos (GP, prova, licença) ficam para a revisão (CODING_STANDARDS.md, Vocabulário).
const AVOID_TERMS = "/\\b(carteira|gancho|odds|teto|rodada|ban|line[- ]?up)\\b/i";
const AVOID_MESSAGE = "Termo marcado como _Avoid_ no GLOSSARY.md: use o termo do glossário.";
const VOCABULARY = [
  ...colorRule(AVOID_TERMS, AVOID_MESSAGE),
  { selector: `JSXText[value=${AVOID_TERMS}]`, message: AVOID_MESSAGE },
];
// "lineup" como palavra de um identificador (lineup, isLineUp, line_up, LINEUP), e não
// dentro de outra (timelineUpdate). Os demais termos ficam só nos textos: em nomes eles
// colidem com palavras comuns ("ban" em "banner").
const LINEUP_WORD =
  "/(^|_)([Ll]ine_?[Uu]p|LINE_?UP)s?($|[A-Z_])|[a-z0-9]Line_?[Uu]ps?($|[A-Z_])/";
const LINEUP_MESSAGE = "line-up é _Avoid_ no GLOSSARY.md: use o termo Dupla (inDupla).";
const LINEUP_IDENTIFIER = [
  { selector: `Identifier[name=${LINEUP_WORD}]`, message: LINEUP_MESSAGE },
  { selector: `JSXIdentifier[name=${LINEUP_WORD}]`, message: LINEUP_MESSAGE },
];
// O que vale em todo arquivo de src/; cada bloco abaixo só acrescenta o que é dele.
const EVERYWHERE = [...HEX, ...MUTED_ON_SURFACE_2, ...LINEUP_IDENTIFIER];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: { "no-restricted-syntax": ["error", ...EVERYWHERE, ...ACCENT_FILL, ...VOCABULARY] },
  },
  {
    // A faixa do topo e o bloco do logotipo são os únicos fundos em accent.
    files: ["src/components/SiteHeader.tsx"],
    rules: { "no-restricted-syntax": ["error", ...EVERYWHERE, ...VOCABULARY] },
  },
  {
    // Testes citam strings da API, inclusive as que saíram de uso ("Suspenso (Ban)").
    files: ["src/**/*.test.ts"],
    rules: { "no-restricted-syntax": ["error", ...EVERYWHERE, ...ACCENT_FILL] },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Worktrees de agentes, com cópias do código.
    ".claude/**",
  ]),
]);

export default eslintConfig;
