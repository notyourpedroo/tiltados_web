import { describe, expect, test } from "vitest";
import { DRIVER_INDICATORS, SEASON_HIGHLIGHT_INDICATORS, TEAM_INDICATORS } from "./indicators";
import { MINIMUM_SESSIONS_SHARE } from "./season-highlights";

// Os indicadores que cada página mostra, um por StatTile (e o card próprio "Melhor forma
// recente" da visão geral). Um card novo entra aqui e no registro do sujeito.
const DRIVER_PROFILE_CARDS = [
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
];
const SEASON_OVERVIEW_CARDS = [
  "rounds",
  "poles",
  "fastestLaps",
  "winSequencia",
  "recentForm",
  "ritmo",
  "aproveitamento",
  "hatTricks",
];
const TEAM_PROFILE_CARDS = [
  "points",
  "wins",
  "podiums",
  "oneTwos",
  "poles",
  "fastestLaps",
  "best",
  "bothScored",
  "recentForm",
  "aproveitamento",
];

describe("Cada card das três páginas tem descrição, para piloto e equipe", () => {
  test.each([
    ["perfil do piloto", DRIVER_INDICATORS, DRIVER_PROFILE_CARDS],
    ["visão geral", SEASON_HIGHLIGHT_INDICATORS, SEASON_OVERVIEW_CARDS],
    ["perfil da equipe", TEAM_INDICATORS, TEAM_PROFILE_CARDS],
  ] as const)("%s: um texto por card, nenhum vazio e nenhum sobrando", (_, indicators, cards) => {
    expect(Object.keys(indicators).sort()).toEqual([...cards].sort());
    for (const description of Object.values(indicators)) {
      expect(description.trim().length).toBeGreaterThan(0);
    }
  });
});

// Uma asserção por indicador: os tickets da equipe e da visão geral só acrescentam
// entradas e casos, sem reescrever os de outro sujeito.

describe("Descrições dos indicadores do piloto", () => {
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

  test("Ritmo diz que o número é a média em porcentagem", () => {
    expect(DRIVER_INDICATORS.ritmo).toMatch(/em média e em porcentagem/);
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

  test.each([
    "poles",
    "fastestLaps",
    "winSequencia",
    "ritmo",
    "aproveitamento",
    "hatTricks",
  ] as const)("%s avisa que empatados aparecem juntos", (key) => {
    expect(SEASON_HIGHLIGHT_INDICATORS[key]).toMatch(/empatados aparecem juntos/);
  });

  // A regra dos destaques e o texto andam juntos: o cálculo corta em MINIMUM_SESSIONS_SHARE
  // (season-highlights.test.ts confere nos limites), e mudar o corte quebra este teste até
  // o texto acompanhar.
  test.each(["ritmo", "aproveitamento"] as const)(
    "%s cita o corte de metade das Sessões",
    (key) => {
      expect(MINIMUM_SESSIONS_SHARE).toBe(1 / 2);
      expect(SEASON_HIGHLIGHT_INDICATORS[key]).toContain("ao menos metade das Sessões");
    },
  );
});

describe("Descrições dos indicadores da equipe", () => {
  test("Pontos somam os de todos os Pilotos da equipe por ela", () => {
    expect(TEAM_INDICATORS.points).toMatch(/todos os Pilotos da equipe/);
  });

  test("Vitórias contam só Corridas", () => {
    expect(TEAM_INDICATORS.wins).toMatch(/só Corridas/);
  });

  test("Pódios contam Corridas e Sprints, um por piloto no pódio", () => {
    expect(TEAM_INDICATORS.podiums).toMatch(/Corridas e Sprints/);
    expect(TEAM_INDICATORS.podiums).toMatch(/um por piloto/);
  });

  test("Dobradinha é 1º e 2º numa Corrida, e a Sprint não conta", () => {
    expect(TEAM_INDICATORS.oneTwos).toMatch(/1º e 2º/);
    expect(TEAM_INDICATORS.oneTwos).toMatch(/Sprint não conta/);
  });

  test("Dois nos pontos conta Sessões em que ao menos dois Pilotos da equipe pontuaram", () => {
    expect(TEAM_INDICATORS.bothScored).toMatch(/Corrida ou Sprint/);
    expect(TEAM_INDICATORS.bothScored).toMatch(/ao menos dois Pilotos da equipe/);
  });

  test("Forma recente soma os pontos de todos os Pilotos da equipe nas últimas 3 Etapas", () => {
    expect(TEAM_INDICATORS.recentForm).toMatch(/todos os Pilotos da equipe/);
    expect(TEAM_INDICATORS.recentForm).toMatch(/últimas 3 Etapas/);
  });

  test("Aproveitamento é a média por participação de piloto", () => {
    expect(TEAM_INDICATORS.aproveitamento).toMatch(/participação de piloto/);
    expect(TEAM_INDICATORS.aproveitamento).toMatch(/conta duas vezes/);
  });
});
