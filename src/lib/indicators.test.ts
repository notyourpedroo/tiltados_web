import { describe, expect, test } from "vitest";
import { DRIVER_INDICATORS, SEASON_HIGHLIGHT_INDICATORS } from "./indicators";
import { hasMinimumSessions } from "./season-highlights";

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

describe("Descrições dos destaques da visão geral", () => {
  test.each([
    "rounds",
    "poles",
    "fastestLaps",
    "winSequencia",
    "recentForm",
    "ritmo",
    "performance",
    "hatTricks",
  ])("%s tem descrição", (key) => {
    const description = (SEASON_HIGHLIGHT_INDICATORS as Record<string, string>)[key];
    expect(description?.trim().length).toBeGreaterThan(0);
  });

  test("Etapas explica a Etapa e a contagem de Sprints", () => {
    expect(SEASON_HIGHLIGHT_INDICATORS.rounds).toContain("fim de semana de GP");
    expect(SEASON_HIGHLIGHT_INDICATORS.rounds).toContain("Sprints");
  });

  test("Mais poles conta só Poles de Corrida", () => {
    expect(SEASON_HIGHLIGHT_INDICATORS.poles).toMatch(/Sprint não conta/);
  });

  test("Maior sequência de vitórias só conta Corridas seguidas", () => {
    expect(SEASON_HIGHLIGHT_INDICATORS.winSequencia).toMatch(/Só Corridas contam/);
    expect(SEASON_HIGHLIGHT_INDICATORS.winSequencia).toMatch(/quebra a Sequência/);
  });

  test("Melhor forma recente soma as últimas 3 Etapas e conta zero na Etapa sem o piloto", () => {
    expect(SEASON_HIGHLIGHT_INDICATORS.recentForm).toContain("últimas 3 Etapas");
    expect(SEASON_HIGHLIGHT_INDICATORS.recentForm).toContain("conta zero");
  });

  test("Hat-tricks explica Pole, vitória e Volta mais rápida na mesma Corrida", () => {
    expect(SEASON_HIGHLIGHT_INDICATORS.hatTricks).toMatch(/Pole, vitória e Volta mais rápida/);
  });

  test.each(["poles", "fastestLaps", "winSequencia", "ritmo", "performance", "hatTricks"] as const)(
    "%s avisa que empatados aparecem juntos",
    (key) => {
      expect(SEASON_HIGHLIGHT_INDICATORS[key]).toMatch(/empatados aparecem juntos/);
    },
  );

  // A regra dos destaques e o texto andam juntos: mudar o corte quebra um dos dois lados.
  test("O corte de Melhor ritmo e Melhor aproveitamento é metade das Sessões", () => {
    expect(hasMinimumSessions(5, 10)).toBe(true);
    expect(hasMinimumSessions(4, 10)).toBe(false);
    expect(hasMinimumSessions(2, 3)).toBe(true);
    expect(hasMinimumSessions(1, 3)).toBe(false);
  });

  test.each(["ritmo", "performance"] as const)("%s cita o corte de metade das Sessões", (key) => {
    expect(SEASON_HIGHLIGHT_INDICATORS[key]).toContain("ao menos metade das Sessões");
  });
});
