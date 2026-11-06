import { describe, expect, test } from "vitest";
import { driverProfile, seasonComparison } from "./driver-season";
import { result, season, session } from "./season-fixtures";

const FERRARI = 1;
const MCLAREN = 2;

describe("Perfil do piloto", () => {
  test("cada Sessão disputada pelo piloto traz o resultado dele e o total acumulado", () => {
    const sprint = session(1, 1, true);
    const race = session(2, 1);
    const skipped = session(3, 2);
    const race3 = session(4, 3);
    const data = season(
      [],
      [sprint, [result(sprint, 10, FERRARI, 2), result(sprint, 20, MCLAREN, 1)]],
      [race, [result(race, 20, MCLAREN, 1), result(race, 10, FERRARI, 3)]],
      // Etapa sem o piloto 10: não entra.
      [skipped, [result(skipped, 20, MCLAREN, 1)]],
      [race3, [result(race3, 10, MCLAREN, 1)]],
    );

    const { sessions } = driverProfile(data, 10);

    expect(sessions.map((s) => [s.session.id, s.result.position, s.result.teamId, s.total])).toEqual([
      [1, 2, FERRARI, 7],
      [2, 3, FERRARI, 22],
      [4, 1, MCLAREN, 47],
    ]);
  });

  test("pole conta só largada em 1º numa Corrida; voltas mais rápidas contam Corrida e Sprint", () => {
    const sprint = session(1, 1, true);
    const race = session(2, 1);
    const race2 = session(3, 2);
    const data = season(
      [],
      [sprint, [result(sprint, 20, MCLAREN, 1, { grid: 2 }), result(sprint, 10, FERRARI, 2, { grid: 1, fastestLap: true })]],
      [race, [result(race, 10, FERRARI, 1, { grid: 1 }), result(race, 20, MCLAREN, 2, { grid: 2, fastestLap: true })]],
      [race2, [result(race2, 20, MCLAREN, 1, { grid: 1 }), result(race2, 10, FERRARI, 2, { grid: 2, fastestLap: true })]],
    );

    const { stats } = driverProfile(data, 10);

    expect(stats.poles).toBe(1);
    expect(stats.fastestLaps).toBe(2);
  });

  test("Hat-trick é Pole, vitória e Volta mais rápida na mesma Corrida", () => {
    const race = session(1, 1);
    const data = season([], [race, [result(race, 10, FERRARI, 1, { grid: 1, fastestLap: true })]]);

    expect(driverProfile(data, 10).stats.hatTricks).toBe(1);
  });

  test.each([
    ["sem Pole", { grid: 2, position: 1, fastestLap: true }],
    ["sem vitória", { grid: 1, position: 2, fastestLap: true }],
    ["sem Volta mais rápida", { grid: 1, position: 1, fastestLap: false }],
  ])("Corrida %s não é Hat-trick", (_, extra) => {
    const race = session(1, 1);
    const data = season([], [race, [result(race, 10, FERRARI, extra.position, extra)]]);

    expect(driverProfile(data, 10).stats.hatTricks).toBe(0);
  });

  test("Sprint com largada e vitória em 1º e Volta mais rápida não conta Hat-trick nem Conversão de pole", () => {
    const sprint = session(1, 1, true);
    const data = season([], [sprint, [result(sprint, 10, FERRARI, 1, { grid: 1, fastestLap: true })]]);

    const { stats } = driverProfile(data, 10);

    expect(stats.hatTricks).toBe(0);
    expect(stats.poleConversion).toEqual({ converted: 0, poles: 0 });
  });

  test("Conversão de pole conta quantas Poles viraram vitória na mesma Corrida", () => {
    const race = session(1, 1);
    const race2 = session(2, 2);
    const race3 = session(3, 3);
    const data = season(
      [],
      [race, [result(race, 10, FERRARI, 1, { grid: 1 })]],
      [race2, [result(race2, 20, MCLAREN, 1, { grid: 2 }), result(race2, 10, FERRARI, 2, { grid: 1 })]],
      // Vitória largando de 3º não conta.
      [race3, [result(race3, 10, FERRARI, 1, { grid: 3 })]],
    );

    expect(driverProfile(data, 10).stats.poleConversion).toEqual({ converted: 1, poles: 2 });
  });

  test("chegada média conta só Corridas; posições ganhas somam o saldo de Corrida e Sprint", () => {
    const sprint = session(1, 1, true);
    const race = session(2, 1);
    const race2 = session(3, 2);
    const data = season(
      [],
      [sprint, [result(sprint, 10, FERRARI, 1, { grid: 6, gained: 5 })]],
      [race, [result(race, 10, FERRARI, 2, { grid: 1, gained: -1 })]],
      [race2, [result(race2, 10, FERRARI, 5, { grid: 3, gained: -2 })]],
    );

    const { stats } = driverProfile(data, 10);

    expect(stats.avgFinish).toBe(3.5);
    expect(stats.gained).toBe(2);
  });

  test("melhor resultado é a melhor posição em qualquer Sessão, com quantas vezes aconteceu", () => {
    const sprint = session(1, 1, true);
    const race = session(2, 1);
    const race2 = session(3, 2);
    const data = season(
      [],
      [sprint, [result(sprint, 20, MCLAREN, 1), result(sprint, 10, FERRARI, 2)]],
      [race, [result(race, 20, MCLAREN, 1), result(race, 10, FERRARI, 3)]],
      [race2, [result(race2, 20, MCLAREN, 1), result(race2, 10, FERRARI, 2)]],
    );

    expect(driverProfile(data, 10).stats.best).toEqual({ position: 2, count: 2 });
  });

  test("piloto só com Sprints fica sem chegada média", () => {
    const sprint = session(1, 1, true);
    const data = season([], [sprint, [result(sprint, 10, FERRARI, 3)]]);

    expect(driverProfile(data, 10).stats.avgFinish).toBeNull();
  });

  test("duelo com cada companheiro conta as Sessões em que correram juntos pela mesma equipe, na ordem em que se encontraram", () => {
    const race = session(1, 1);
    const sprint = session(2, 2, true);
    const race2 = session(3, 2);
    const data = season(
      [],
      [race, [result(race, 11, FERRARI, 1), result(race, 10, FERRARI, 2), result(race, 20, MCLAREN, 3)]],
      // O piloto 10 passa para a McLaren: o 11 deixa de ser companheiro.
      [sprint, [result(sprint, 10, MCLAREN, 1), result(sprint, 11, FERRARI, 2), result(sprint, 20, MCLAREN, 3)]],
      [race2, [result(race2, 20, MCLAREN, 1), result(race2, 10, MCLAREN, 2), result(race2, 11, FERRARI, 3)]],
    );

    expect(driverProfile(data, 10).duels).toEqual([
      { id: 11, ahead: 0, behind: 1 },
      { id: 20, ahead: 1, behind: 1 },
    ]);
  });

  test("Forma recente soma Corrida e Sprint das últimas 3 Etapas da temporada, contando zero na Etapa sem o piloto", () => {
    const r1 = session(1, 1);
    const sprint2 = session(2, 2, true);
    const r2 = session(3, 2);
    const r3 = session(4, 3);
    const r4 = session(5, 4);
    const data = season(
      [],
      // Etapa 1 fica fora da janela.
      [r1, [result(r1, 10, FERRARI, 1)]],
      // A Etapa 2 tem Sprint e Corrida, mas ocupa uma vaga só.
      [sprint2, [result(sprint2, 10, FERRARI, 1)]],
      [r2, [result(r2, 10, FERRARI, 2)]],
      // Etapa 3 sem o piloto 10: conta zero e não puxa a Etapa 1 para a janela.
      [r3, [result(r3, 20, MCLAREN, 1)]],
      [r4, [result(r4, 10, FERRARI, 3)]],
    );

    expect(driverProfile(data, 10).stats.recentForm).toBe(8 + 18 + 15);
  });

  test("Forma recente usa as Etapas que houver quando a temporada tem menos de 3", () => {
    const sprint = session(1, 1, true);
    const race = session(2, 1);
    const data = season(
      [],
      [sprint, [result(sprint, 10, FERRARI, 2)]],
      [race, [result(race, 10, FERRARI, 1)]],
    );

    expect(driverProfile(data, 10).stats.recentForm).toBe(7 + 25);
  });

  test("Ritmo é a média da distância, em fração, entre a melhor volta do piloto e a Volta mais rápida de cada Sessão", () => {
    const sprint = session(1, 1, true);
    const race = session(2, 1);
    const data = season(
      [],
      // 1:31.000 contra 1:30.000 → 1/90 atrás; 1:42.000 contra 1:40.000 → 2/100 atrás.
      [sprint, [result(sprint, 20, MCLAREN, 1, { bestLap: "1:30.000" }), result(sprint, 10, FERRARI, 2, { bestLap: "1:31.000" })]],
      [race, [result(race, 20, MCLAREN, 1, { bestLap: "1:40.000" }), result(race, 10, FERRARI, 2, { bestLap: "1:42.000" })]],
    );

    expect(driverProfile(data, 10).stats.ritmo).toBeCloseTo((1 / 90 + 0.02) / 2, 10);
  });

  test("piloto que fez a Volta mais rápida em todas as Sessões tem Ritmo zero", () => {
    const race = session(1, 1);
    const race2 = session(2, 2);
    const data = season(
      [],
      [race, [result(race, 10, FERRARI, 1, { bestLap: "1:29.500" }), result(race, 20, MCLAREN, 2, { bestLap: "1:30.000" })]],
      [race2, [result(race2, 20, MCLAREN, 1, { bestLap: "1:31.000" }), result(race2, 10, FERRARI, 2, { bestLap: "1:30.250" })]],
    );

    expect(driverProfile(data, 10).stats.ritmo).toBe(0);
  });

  test("Sessão sem tempo válido do piloto fica fora do Ritmo", () => {
    const race = session(1, 1);
    const race2 = session(2, 2);
    const data = season(
      [],
      [race, [result(race, 20, MCLAREN, 1, { bestLap: "1:30.000" }), result(race, 10, FERRARI, 2, { bestLap: "1:33.000" })]],
      // Sem volta: se entrasse, puxaria a média para baixo (ou quebraria a conta).
      [race2, [result(race2, 20, MCLAREN, 1, { bestLap: "1:30.000" }), result(race2, 10, FERRARI, 2, { bestLap: "" })]],
    );

    expect(driverProfile(data, 10).stats.ritmo).toBeCloseTo(3 / 90, 10);
  });

  test("Sessão com o tempo de quem não marcou volta (\"9:99.999\", da API de 2025) fica fora do Ritmo", () => {
    const race = session(1, 1);
    const race2 = session(2, 2);
    const data = season(
      [],
      [race, [result(race, 20, MCLAREN, 1, { bestLap: "1:30.000" }), result(race, 10, FERRARI, 2, { bestLap: "1:33.000" })]],
      [race2, [result(race2, 20, MCLAREN, 1, { bestLap: "1:30.000" }), result(race2, 10, FERRARI, 2, { bestLap: "9:99.999" })]],
    );

    expect(driverProfile(data, 10).stats.ritmo).toBeCloseTo(3 / 90, 10);
  });

  test("piloto sem nenhum tempo válido fica sem Ritmo", () => {
    const race = session(1, 1);
    const data = season(
      [],
      [race, [result(race, 20, MCLAREN, 1, { bestLap: "1:30.000" }), result(race, 10, FERRARI, 2, { bestLap: "-" })]],
    );

    expect(driverProfile(data, 10).stats.ritmo).toBeNull();
  });

  test("Aproveitamento: pontos por Sessão disputada e a parte das Sessões em que pontuou, sem contar as Sessões em que faltou", () => {
    const sprint = session(1, 1, true);
    const race = session(2, 1);
    const skipped = session(3, 2);
    const race3 = session(4, 3);
    const race4 = session(5, 4);
    const data = season(
      [],
      // 8 + 0 + 25 + 18 = 51 pts em 4 Sessões, pontuando em 3.
      [sprint, [result(sprint, 10, FERRARI, 1)]],
      [race, [result(race, 10, FERRARI, 7)]],
      [skipped, [result(skipped, 20, MCLAREN, 1)]],
      [race3, [result(race3, 10, FERRARI, 1)]],
      [race4, [result(race4, 10, MCLAREN, 2)]],
    );

    expect(driverProfile(data, 10).performance).toEqual({ pointsPerSession: 12.75, scoringRate: 0.75 });
  });

  test("piloto sem Sessão disputada tem as estatísticas zeradas, sem chegada média, melhor resultado nem Aproveitamento", () => {
    const race = session(1, 1);
    const withSessions = season([], [race, [result(race, 20, MCLAREN, 1)]]);
    const empty = {
      stats: {
        poles: 0,
        fastestLaps: 0,
        avgFinish: null,
        gained: 0,
        best: null,
        recentForm: 0,
        ritmo: null,
        hatTricks: 0,
        poleConversion: { converted: 0, poles: 0 },
      },
      sequencias: {
        scoring: { best: 0, current: 0 },
        podium: { best: 0, current: 0 },
        win: { best: 0, current: 0 },
      },
      performance: null,
      sessions: [],
      duels: [],
    };

    expect(driverProfile(withSessions, 10)).toEqual(empty);
    expect(driverProfile(season([]), 10)).toEqual(empty);
  });
});

describe("Sequências do piloto", () => {
  /** Uma Corrida por Etapa, com o piloto 10 na posição dada. */
  function races(...positions: number[]) {
    return season(
      [],
      ...positions.map((position, i) => {
        const race = session(i + 1, i + 1);
        const entry: Parameters<typeof season>[1] = [race, [result(race, 10, FERRARI, position)]];
        return entry;
      }),
    );
  }

  test("a atual é a corrente que chega à última Corrida, e pode ser menor que a maior", () => {
    // Pontua nas 3 primeiras, fica fora dos pontos na 4ª e volta a pontuar na 5ª.
    const data = races(1, 2, 3, 9, 4);

    expect(driverProfile(data, 10).sequencias.scoring).toEqual({ best: 3, current: 1 });
  });

  test("pódio e vitória contam cada um o seu critério", () => {
    const data = races(1, 1, 2, 3, 1, 5);

    const { sequencias } = driverProfile(data, 10);

    expect(sequencias.podium).toEqual({ best: 5, current: 0 });
    expect(sequencias.win).toEqual({ best: 2, current: 0 });
  });

  test("a Sprint no meio da corrente é ignorada, sem somar nem quebrar", () => {
    const race = session(1, 1);
    const sprint = session(2, 2, true);
    const race2 = session(3, 2);
    const data = season(
      [],
      [race, [result(race, 10, FERRARI, 1)]],
      // Fora dos pontos e sem vencer na Sprint.
      [sprint, [result(sprint, 20, MCLAREN, 1), result(sprint, 10, FERRARI, 9)]],
      [race2, [result(race2, 10, FERRARI, 1)]],
    );

    const { sequencias } = driverProfile(data, 10);

    expect(sequencias.scoring).toEqual({ best: 2, current: 2 });
    expect(sequencias.win).toEqual({ best: 2, current: 2 });
  });

  test("uma Corrida sem o piloto zera a corrente", () => {
    const race = session(1, 1);
    const skipped = session(2, 2);
    const race3 = session(3, 3);
    const data = season(
      [],
      [race, [result(race, 10, FERRARI, 1)]],
      [skipped, [result(skipped, 20, MCLAREN, 1)]],
      [race3, [result(race3, 10, FERRARI, 1)]],
    );

    expect(driverProfile(data, 10).sequencias.win).toEqual({ best: 1, current: 1 });
  });

  test("sem ter disputado a última Corrida da temporada, a atual é zero", () => {
    const race = session(1, 1);
    const race2 = session(2, 2);
    const data = season(
      [],
      [race, [result(race, 10, FERRARI, 1)]],
      [race2, [result(race2, 20, MCLAREN, 1)]],
    );

    expect(driverProfile(data, 10).sequencias.win).toEqual({ best: 1, current: 0 });
  });

  test("temporada só com Sprint não tem Sequência", () => {
    const sprint = session(1, 1, true);
    const data = season([], [sprint, [result(sprint, 10, FERRARI, 1)]]);

    expect(driverProfile(data, 10).sequencias.win).toEqual({ best: 0, current: 0 });
  });
});

describe("Comparativo com as Temporadas anteriores", () => {
  const sprint = session(1, 1, true);
  const race = session(2, 1);
  const race2 = session(3, 2);
  // Temporada anterior: piloto 10 numa Sprint (2º) e em duas Corridas (1º e 4º).
  const previous = season(
    [],
    [sprint, [result(sprint, 20, MCLAREN, 1, { bestLap: "1:30.000" }), result(sprint, 10, FERRARI, 2, { bestLap: "1:30.900" })]],
    [race, [result(race, 10, FERRARI, 1, { bestLap: "1:30.000" }), result(race, 20, MCLAREN, 2, { bestLap: "1:30.450" })]],
    [race2, [result(race2, 20, MCLAREN, 1, { bestLap: "1:30.000" }), result(race2, 10, FERRARI, 4, { bestLap: "1:31.800" })]],
  );
  // Temporada atual até agora: piloto 10 só numa Corrida (3º); piloto 30 estreante.
  const current = season(
    [],
    [race, [result(race, 20, MCLAREN, 1, { bestLap: "1:30.000" }), result(race, 30, MCLAREN, 2), result(race, 10, FERRARI, 3, { bestLap: "1:30.900" })]],
  );

  // Outra Temporada anterior: piloto 10 só numa Corrida (2º).
  const older = season([], [race, [result(race, 20, MCLAREN, 1), result(race, 10, FERRARI, 2)]]);
  // Temporada anterior sem nenhuma Sessão do piloto 10.
  const skipped = season([], [race, [result(race, 20, MCLAREN, 1)]]);

  /** Perfis do piloto nas Temporadas anteriores, em ordem cronológica. */
  const before = (driverId: number, ...seasons: [string, ReturnType<typeof season>][]) =>
    seasons.map(([id, data]) => ({ season: id, profile: driverProfile(data, driverId) }));

  test("compara as médias por Sessão da temporada atual com as da Temporada anterior", () => {
    const comparison = seasonComparison(driverProfile(current, 10), before(10, ["2025", previous]));

    expect(comparison?.current).toEqual({ pointsPerSession: 15, raceWinRate: 0, podiumRate: 1, avgFinish: 3, ritmo: 0.01 });
    expect(comparison?.previous.map((p) => p.season)).toEqual(["2025"]);
    // 7 + 25 + 12 pontos em 3 Sessões; Ritmo: 1%, 0% e 2%.
    expect(comparison?.previous[0].averages).toEqual({
      pointsPerSession: expect.closeTo(44 / 3),
      raceWinRate: 0.5,
      podiumRate: expect.closeTo(2 / 3),
      avgFinish: 2.5,
      ritmo: expect.closeTo(0.01),
    });
    expect(comparison?.reference.season).toBe("2025");
  });

  test("traz as várias Temporadas anteriores em ordem cronológica, com a seta contra a mais recente", () => {
    const comparison = seasonComparison(driverProfile(current, 10), before(10, ["2024", older], ["2025", previous]));

    expect(comparison?.previous.map((p) => p.season)).toEqual(["2024", "2025"]);
    expect(comparison?.previous[0].averages.pointsPerSession).toBe(18);
    expect(comparison?.reference.season).toBe("2025");
    expect(comparison?.reference.averages.avgFinish).toBe(2.5);
  });

  test("Temporada anterior sem Sessão do piloto fica de fora, e a seta vai contra a mais recente disputada", () => {
    const comparison = seasonComparison(
      driverProfile(current, 10),
      before(10, ["2023", older], ["2024", previous], ["2025", skipped]),
    );

    expect(comparison?.previous.map((p) => p.season)).toEqual(["2023", "2024"]);
    expect(comparison?.reference.season).toBe("2024");
    expect(comparison?.reference.averages.avgFinish).toBe(2.5);
  });

  test("só aparece para quem tem Sessão disputada na temporada atual e em alguma Temporada anterior", () => {
    // Estreante: não correu nenhuma Temporada anterior.
    expect(seasonComparison(driverProfile(current, 30), before(30, ["2024", older], ["2025", previous]))).toBeNull();
    // Correu as anteriores, mas ainda não a atual.
    expect(seasonComparison(driverProfile(skipped, 10), before(10, ["2024", older], ["2025", previous]))).toBeNull();
    // Correu a atual, mas nenhuma das Temporadas anteriores tem Sessão dele.
    expect(seasonComparison(driverProfile(current, 10), before(10, ["2025", skipped]))).toBeNull();
    // Primeira temporada: não há Temporada anterior.
    expect(seasonComparison(driverProfile(current, 10), [])).toBeNull();
  });

  test("piloto que só correu Sprint não tem % de vitórias em Corridas nem chegada média", () => {
    const sprintOnly = season([], [sprint, [result(sprint, 10, FERRARI, 1)]]);

    const comparison = seasonComparison(driverProfile(sprintOnly, 10), before(10, ["2025", previous]));

    expect(comparison?.current).toMatchObject({ pointsPerSession: 8, raceWinRate: null, podiumRate: 1, avgFinish: null });
  });
});
