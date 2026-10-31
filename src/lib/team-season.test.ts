import { describe, expect, test } from "vitest";
import type { Session, SessionResult } from "./season";
import { teamProfile } from "./team-season";

const RACE_POINTS = [25, 18, 15, 12, 10, 8];
const SPRINT_POINTS = [8, 7, 6, 5, 4, 3];

const FERRARI = 1;
const MCLAREN = 2;
const WILLIAMS = 3;

function session(id: number, round: number, isSprint = false): Session {
  return {
    id,
    name: isSprint ? "GP de Teste (SPRINT)" : "GP de Teste",
    gpName: "GP de Teste",
    date: "2026-10-26",
    location: "Autódromo",
    isSprint,
    round,
  };
}

/** Resultado de um piloto numa Sessão, com os pontos da posição. */
function result(
  s: Session,
  driverId: number,
  teamId: number,
  position: number,
  extra: Partial<SessionResult> = {},
): SessionResult {
  const points = (s.isSprint ? SPRINT_POINTS : RACE_POINTS)[position - 1] ?? 0;
  return {
    driverId,
    teamId,
    position,
    grid: position,
    gained: 0,
    bestLap: "1:30.000",
    fastestLap: false,
    points,
    ...extra,
  };
}

/** Temporada com as Sessões na ordem dada e os resultados de cada uma. */
function seasonOf(...entries: [Session, SessionResult[]][]) {
  return {
    sessions: entries.map(([s]) => s),
    results: Object.fromEntries(entries.map(([s, list]) => [s.id, list])),
  };
}

describe("Perfil da equipe", () => {
  test("piloto que troca de equipe soma para cada equipe só os pontos que fez por ela", () => {
    const r1 = session(1, 1);
    const r2 = session(2, 2);
    const data = seasonOf(
      [r1, [result(r1, 10, FERRARI, 1), result(r1, 11, MCLAREN, 2), result(r1, 12, MCLAREN, 3)]],
      [r2, [result(r2, 11, FERRARI, 1), result(r2, 10, FERRARI, 2), result(r2, 12, MCLAREN, 4)]],
    );

    expect(teamProfile(data, FERRARI).stats.points).toBe(25 + 25 + 18);
    expect(teamProfile(data, MCLAREN).stats.points).toBe(18 + 15 + 12);
  });

  test("vitória e Dobradinha contam só Corrida; 1º e 2º numa Sprint não é Dobradinha", () => {
    const sprint = session(1, 1, true);
    const race = session(2, 1);
    const race2 = session(3, 2);
    const data = seasonOf(
      [sprint, [result(sprint, 10, FERRARI, 1), result(sprint, 11, FERRARI, 2)]],
      [race, [result(race, 10, FERRARI, 1), result(race, 11, FERRARI, 2)]],
      [race2, [result(race2, 20, MCLAREN, 1), result(race2, 11, FERRARI, 2), result(race2, 10, FERRARI, 3)]],
    );

    const { stats } = teamProfile(data, FERRARI);
    expect(stats.wins).toBe(1);
    expect(stats.oneTwos).toBe(1);
  });

  test("pódios, poles e voltas mais rápidas contam Corrida e Sprint, de cada piloto da equipe", () => {
    const sprint = session(1, 1, true);
    const race = session(2, 1);
    const data = seasonOf(
      [
        sprint,
        [
          result(sprint, 10, FERRARI, 1, { grid: 1 }),
          result(sprint, 11, FERRARI, 2, { grid: 3, fastestLap: true }),
          result(sprint, 20, MCLAREN, 3, { grid: 2 }),
        ],
      ],
      [
        race,
        [
          result(race, 20, MCLAREN, 1, { grid: 2 }),
          result(race, 10, FERRARI, 3, { grid: 1, fastestLap: true }),
          result(race, 11, FERRARI, 4, { grid: 3 }),
        ],
      ],
    );

    const { stats } = teamProfile(data, FERRARI);
    expect(stats.podiums).toBe(3);
    expect(stats.poles).toBe(2);
    expect(stats.fastestLaps).toBe(2);
  });

  test("melhor resultado é a melhor posição de qualquer piloto da equipe, com quantas vezes aconteceu", () => {
    const sprint = session(1, 1, true);
    const race = session(2, 1);
    const race2 = session(3, 2);
    const data = seasonOf(
      [sprint, [result(sprint, 20, MCLAREN, 1), result(sprint, 10, FERRARI, 2), result(sprint, 11, FERRARI, 5)]],
      [race, [result(race, 20, MCLAREN, 1), result(race, 11, FERRARI, 2)]],
      [race2, [result(race2, 20, MCLAREN, 1), result(race2, 10, FERRARI, 3)]],
    );

    expect(teamProfile(data, FERRARI).stats.best).toEqual({ position: 2, count: 2 });
  });

  test("conta as Sessões em que dois pilotos da equipe pontuaram, em Corrida ou Sprint", () => {
    const sprint = session(1, 1, true);
    const race = session(2, 1);
    const race2 = session(3, 2);
    const data = seasonOf(
      // Sprint: os dois pontuam (6º ainda pontua).
      [sprint, [result(sprint, 10, FERRARI, 1), result(sprint, 11, FERRARI, 6)]],
      // Corrida: só um pontua.
      [race, [result(race, 10, FERRARI, 1), result(race, 11, FERRARI, 7)]],
      // Corrida: os dois pontuam.
      [race2, [result(race2, 11, FERRARI, 4), result(race2, 10, FERRARI, 5)]],
    );

    expect(teamProfile(data, FERRARI).stats.bothScored).toBe(2);
  });

  test("equipe sem Sessão disputada tem as estatísticas zeradas e fica sem melhor resultado", () => {
    const race = session(1, 1);
    const withSessions = seasonOf([race, [result(race, 10, FERRARI, 1), result(race, 20, MCLAREN, 2)]]);
    const empty = { stats: { points: 0, wins: 0, oneTwos: 0, podiums: 0, poles: 0, fastestLaps: 0, best: null, bothScored: 0 } };

    expect(teamProfile(withSessions, WILLIAMS)).toEqual(empty);
    expect(teamProfile(seasonOf(), WILLIAMS)).toEqual(empty);
  });
});
