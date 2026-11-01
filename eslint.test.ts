import { ESLint } from "eslint";
import { describe, expect, test } from "vitest";

// As regras de no-restricted-syntax do eslint.config.mjs são regex sobre o texto do
// código. Cada linha da tabela é um trecho que deve disparar (com um pedaço da
// mensagem esperada) ou passar, para uma mudança de regex não abrir buraco nem pegar
// nome legítimo. O arquivo não precisa existir: o caminho só escolhe o bloco da config.

const eslint = new ESLint({ cwd: __dirname });

async function restricted(code: string, filePath = "src/lib/probe.tsx"): Promise<string[]> {
  const [result] = await eslint.lintText(code, { filePath });
  return result.messages.filter((m) => m.ruleId === "no-restricted-syntax").map((m) => m.message);
}

const HEX = "Cor em hex";
const MUTED = "text-muted sobre bg-surface-2";
const ACCENT = "bg-accent é só";
const AVOID = "Termo marcado como _Avoid_";
const LINEUP = "line-up é _Avoid_";

describe("Regras do ESLint", () => {
  test.each([
    // Cores
    ['export const c = "#ff0000";', HEX],
    ["export const c = `border-[#abc]`;", HEX],
    ['export const c = "text-text-2";', null],
    ['export const c = "bg-surface-2 text-muted";', MUTED],
    ['export const c = "bg-surface-2 text-text-2";', null],
    ['export const c = "bg-accent";', ACCENT],
    ['export const c = "text-accent";', null],
    // Vocabulário nos textos
    ['export const t = "Sua carteira";', AVOID],
    ['export const t = "a line up forte";', AVOID],
    ['export const t = "o lineup";', AVOID],
    ["export const el = <p>Gancho de 2 etapas</p>;", AVOID],
    ['export const t = "bandeira";', null],
    // "lineup" nos identificadores
    ["export const lineup = 1;", LINEUP],
    ["export const isLineUp = 1;", LINEUP],
    ["export const line_up = 1;", LINEUP],
    ["export const LINEUP = 1;", LINEUP],
    ["export const teamLineups = 1;", LINEUP],
    ['export const el = <div lineup="x" />;', LINEUP],
    ["export const timelineUpdate = 1;", null],
    ["export const pipelineUpdate = 1;", null],
    ["export const inlineUpload = 1;", null],
    ["export const outline = 1;", null],
  ])("%s", async (code, expected) => {
    const messages = await restricted(code);
    if (expected) expect(messages.join("\n")).toContain(expected);
    else expect(messages).toEqual([]);
  });

  test("bg-accent passa no SiteHeader", async () => {
    expect(await restricted('export const c = "bg-accent";', "src/components/SiteHeader.tsx")).toEqual([]);
  });

  test("testes citam strings da API com termos _Avoid_", async () => {
    expect(await restricted('export const s = "Suspenso (Ban)";', "src/lib/probe.test.ts")).toEqual([]);
  });

  test("testes também barram lineup em identificadores", async () => {
    expect((await restricted("export const lineup = 1;", "src/lib/probe.test.ts")).join("\n")).toContain(LINEUP);
  });
});
