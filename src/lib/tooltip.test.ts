import { describe, expect, test } from "vitest";
import { tooltipPlacement } from "./tooltip";

const viewport = { width: 1280, height: 800 };
// Card de 200 px de largura e 100 px de altura.
const card = (left: number, top: number) => ({ left, top, bottom: top + 100 });

describe("Posição do tooltip na janela", () => {
  test("abre abaixo do card, alinhado à esquerda dele, quando cabe", () => {
    expect(tooltipPlacement(card(100, 100), 80, viewport)).toEqual({
      left: 0,
      width: 288,
      above: false,
    });
  });

  test("na borda direita, é empurrado para dentro com 16 px de folga", () => {
    expect(tooltipPlacement(card(1100, 100), 80, viewport)).toEqual({
      left: 1280 - 16 - 288 - 1100,
      width: 288,
      above: false,
    });
  });

  test("numa janela estreita, encolhe até caber com 16 px de folga dos dois lados", () => {
    expect(tooltipPlacement(card(20, 100), 80, { width: 300, height: 800 })).toEqual({
      left: -4,
      width: 268,
      above: false,
    });
  });

  test("perto do rodapé, abre para cima", () => {
    // Abaixo sobram 800 - 700 = 100 px, menos que 8 + 80 + 16.
    expect(tooltipPlacement(card(100, 600), 80, viewport).above).toBe(true);
  });

  test("abre abaixo enquanto o balão cabe com a folga do rodapé", () => {
    // 600 + 8 + 176 + 16 = 800: cabe exatamente.
    expect(tooltipPlacement(card(100, 500), 176, viewport).above).toBe(false);
    expect(tooltipPlacement(card(100, 500), 177, viewport).above).toBe(true);
  });

  test("quando não cabe em nenhum lado, abre para o lado com mais espaço", () => {
    const short = { width: 1280, height: 300 };
    expect(tooltipPlacement(card(100, 40), 200, short).above).toBe(false);
    expect(tooltipPlacement(card(100, 160), 200, short).above).toBe(true);
  });
});
