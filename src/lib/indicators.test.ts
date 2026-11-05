import { describe, expect, test } from "vitest";
import { DRIVER_INDICATORS } from "./indicators";

// Uma asserção por indicador: os tickets da equipe e da visão geral só acrescentam
// entradas e casos, sem reescrever os de outro sujeito.

describe("Descrições dos indicadores do piloto", () => {
  test.each([
    "points",
    "wins",
    "podiums",
    "best",
    "poles",
    "fastestLaps",
    "hatTricks",
    "avgFinish",
    "gained",
    "recentForm",
    "ritmo",
    "aproveitamento",
    "sequenciaScoring",
    "sequenciaPodium",
    "sequenciaWin",
  ])("%s tem descrição", (key) => {
    const description = (DRIVER_INDICATORS as Record<string, string>)[key];
    expect(description?.trim().length).toBeGreaterThan(0);
  });

  test("Pole só conta em Corrida", () => {
    expect(DRIVER_INDICATORS.poles).toContain("Corrida");
    expect(DRIVER_INDICATORS.poles).toMatch(/Sprint não conta/);
  });

  test("Vitórias contam Corridas e mostram as de Sprint à parte", () => {
    expect(DRIVER_INDICATORS.wins).toContain("Corridas");
    expect(DRIVER_INDICATORS.wins).toMatch(/Sprint.*à parte/);
  });

  test("Pódios contam Corridas e Sprints", () => {
    expect(DRIVER_INDICATORS.podiums).toMatch(/Corridas e Sprints/);
  });

  test("Chegada média deixa as Sprints de fora", () => {
    expect(DRIVER_INDICATORS.avgFinish).toMatch(/Sprints não contam/);
  });

  test("Posições ganhas pode ser negativo", () => {
    expect(DRIVER_INDICATORS.gained).toContain("negativo");
  });

  test.each(["sequenciaScoring", "sequenciaPodium", "sequenciaWin"] as const)(
    "%s só conta Corridas e explica o atual",
    (key) => {
      expect(DRIVER_INDICATORS[key]).toMatch(/Só Corridas contam/);
      expect(DRIVER_INDICATORS[key]).toContain("atual");
    },
  );
});
