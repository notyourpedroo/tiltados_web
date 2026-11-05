import { describe, expect, test } from "vitest";
import { driverProfile } from "./driver-season";
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

  test("poles e voltas mais rápidas contam Corrida e Sprint", () => {
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

    expect(stats.poles).toBe(2);
    expect(stats.fastestLaps).toBe(2);
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

  test("piloto sem Sessão disputada tem as estatísticas zeradas, sem chegada média nem melhor resultado", () => {
    const race = session(1, 1);
    const withSessions = season([], [race, [result(race, 20, MCLAREN, 1)]]);
    const empty = {
      stats: { poles: 0, fastestLaps: 0, avgFinish: null, gained: 0, best: null },
      sessions: [],
      duels: [],
    };

    expect(driverProfile(withSessions, 10)).toEqual(empty);
    expect(driverProfile(season([]), 10)).toEqual(empty);
  });
});
