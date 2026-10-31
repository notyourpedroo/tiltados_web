import { describe, expect, test } from "vitest";
import type { SeasonData, Session, SessionResult, Team } from "./season";
import { constructorsProgression, teamProfile } from "./team-season";

const RACE_POINTS = [25, 18, 15, 12, 10, 8];
const SPRINT_POINTS = [8, 7, 6, 5, 4, 3];

const FERRARI = 1;
const MCLAREN = 2;
const WILLIAMS = 3;
const HAAS = 4;

function team(id: number, name: string): Team {
  return { id, name, short: name, color: `var(--team-${id})` };
}

function session(id: number, round: number, isSprint = false): Session {
  return {
    id,
    name: isSprint ? `GP de Teste ${round} (SPRINT)` : `GP de Teste ${round}`,
    gpName: `GP de Teste ${round}`,
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

/**
 * Temporada mínima: equipes na ordem da classificação de construtores final e
 * as Sessões na ordem dada, com os resultados de cada uma.
 */
function season(teams: Team[], ...entries: [Session, SessionResult[]][]): SeasonData {
  return {
    season: "2026",
    teams: Object.fromEntries(teams.map((t) => [t.id, t])),
    drivers: {},
    sessions: entries.map(([s]) => s),
    results: Object.fromEntries(entries.map(([s, list]) => [s.id, list])),
    driverStandings: [],
    teamStandings: teams.map((t, i) => ({
      position: i + 1,
      team_id: t.id,
      team_name: t.name,
      points: 0,
      wins: 0,
      podiums: 0,
    })),
    progression: [],
    punishments: [],
  };
}

describe("Perfil da equipe", () => {
  test("piloto que troca de equipe soma para cada equipe só os pontos que fez por ela", () => {
    const r1 = session(1, 1);
    const r2 = session(2, 2);
    const data = season(
      [],
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
    const data = season(
      [],
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
    const data = season(
      [],
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
    const data = season(
      [],
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
    const data = season(
      [],
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
    const withSessions = season([], [race, [result(race, 10, FERRARI, 1), result(race, 20, MCLAREN, 2)]]);
    const empty = { stats: { points: 0, wins: 0, oneTwos: 0, podiums: 0, poles: 0, fastestLaps: 0, best: null, bothScored: 0 } };

    expect(teamProfile(withSessions, WILLIAMS)).toMatchObject(empty);
    expect(teamProfile(season([]), WILLIAMS)).toMatchObject(empty);
  });

  test("cada Sessão disputada pela equipe traz os pontos dela na Sessão e o total acumulado", () => {
    const sprint = session(1, 1, true);
    const race = session(2, 1);
    const skipped = session(3, 2);
    const race3 = session(4, 3);
    const data = season(
      [],
      [sprint, [result(sprint, 10, FERRARI, 1), result(sprint, 20, MCLAREN, 2), result(sprint, 11, FERRARI, 4)]],
      [race, [result(race, 20, MCLAREN, 1), result(race, 10, FERRARI, 3), result(race, 11, FERRARI, 9)]],
      // Etapa sem a Ferrari: não entra.
      [skipped, [result(skipped, 20, MCLAREN, 1)]],
      [race3, [result(race3, 11, FERRARI, 2), result(race3, 10, FERRARI, 12)]],
    );

    const { sessions } = teamProfile(data, FERRARI);

    expect(sessions.map((s) => [s.session.id, s.points, s.total])).toEqual([
      [1, 13, 13],
      [2, 15, 28],
      [4, 18, 46],
    ]);
  });

  test("cada Sessão traz a posição de cada piloto da equipe, em ordem de chegada, só enquanto ele correu por ela", () => {
    const race = session(1, 1);
    const sprint = session(2, 2, true);
    const race2 = session(3, 2);
    const data = season(
      [],
      [race, [result(race, 11, FERRARI, 2), result(race, 20, MCLAREN, 3), result(race, 10, FERRARI, 5)]],
      // O piloto 10 passa para a McLaren; o 12 entra na Ferrari.
      [sprint, [result(sprint, 10, MCLAREN, 1), result(sprint, 12, FERRARI, 3), result(sprint, 11, FERRARI, 7)]],
      [race2, [result(race2, 12, FERRARI, 1), result(race2, 11, FERRARI, 4), result(race2, 10, MCLAREN, 6)]],
    );

    const drivers = (teamId: number) =>
      teamProfile(data, teamId).sessions.map((s) => s.drivers.map((d) => [d.driverId, d.position]));

    expect(drivers(FERRARI)).toEqual([
      [[11, 2], [10, 5]],
      [[12, 3], [11, 7]],
      [[12, 1], [11, 4]],
    ]);
    expect(drivers(MCLAREN)).toEqual([
      [[20, 3]],
      [[10, 1]],
      [[10, 6]],
    ]);
  });

  test("o total acumulado da última Sessão bate com os pontos da equipe", () => {
    const sprint = session(1, 1, true);
    const race = session(2, 1);
    const data = season(
      [],
      [sprint, [result(sprint, 10, FERRARI, 2), result(sprint, 11, FERRARI, 3)]],
      [race, [result(race, 11, FERRARI, 1), result(race, 10, FERRARI, 6)]],
    );

    const { stats, sessions } = teamProfile(data, FERRARI);

    expect(sessions.at(-1)?.total).toBe(13 + 33);
    expect(stats.points).toBe(13 + 33);
  });

  test("equipe sem Sessão disputada fica sem Sessões", () => {
    const race = session(1, 1);
    const data = season([], [race, [result(race, 10, FERRARI, 1)]]);

    expect(teamProfile(data, WILLIAMS).sessions).toEqual([]);
    expect(teamProfile(season([]), WILLIAMS).sessions).toEqual([]);
  });
});

describe("Pilotos da equipe e duelos", () => {
  test("piloto que troca de equipe é Piloto das duas, cada uma com só os pontos que ele fez por ela", () => {
    const r1 = session(1, 1);
    const sprint = session(2, 2, true);
    const r2 = session(3, 2);
    const data = season(
      [],
      [r1, [result(r1, 10, FERRARI, 1), result(r1, 11, MCLAREN, 2), result(r1, 12, FERRARI, 3)]],
      // O piloto 11 passa da McLaren para a Ferrari; o 12 vai para a McLaren.
      [sprint, [result(sprint, 11, FERRARI, 1), result(sprint, 12, MCLAREN, 2), result(sprint, 10, FERRARI, 3)]],
      [r2, [result(r2, 12, MCLAREN, 1), result(r2, 10, FERRARI, 2), result(r2, 11, FERRARI, 4)]],
    );

    const ferrari = teamProfile(data, FERRARI);
    const mclaren = teamProfile(data, MCLAREN);

    expect(ferrari.drivers.map((d) => [d.id, d.points])).toEqual([
      [10, 25 + 6 + 18],
      [11, 8 + 12],
      [12, 15],
    ]);
    expect(mclaren.drivers.map((d) => [d.id, d.points])).toEqual([
      [12, 7 + 25],
      [11, 18],
    ]);
    const sum = (p: typeof ferrari) => p.drivers.reduce((total, d) => total + d.points, 0);
    expect(sum(ferrari)).toBe(ferrari.stats.points);
    expect(sum(mclaren)).toBe(mclaren.stats.points);
  });

  test("só os pilotos que a equipe tem no cadastro vêm marcados como Dupla", () => {
    const r1 = session(1, 1);
    const r2 = session(2, 2);
    const data = season(
      [],
      [r1, [result(r1, 10, FERRARI, 1), result(r1, 12, FERRARI, 2), result(r1, 11, MCLAREN, 3)]],
      // Depois da troca, o 11 corre pela Ferrari e o 12 pela McLaren, como no cadastro.
      [r2, [result(r2, 11, FERRARI, 1), result(r2, 12, MCLAREN, 2), result(r2, 10, FERRARI, 3)]],
    );
    data.drivers = {
      10: { id: 10, name: "Matheus", teamId: FERRARI },
      11: { id: 11, name: "Gabriel", teamId: FERRARI },
      12: { id: 12, name: "Lucas", teamId: MCLAREN },
    };

    expect(teamProfile(data, FERRARI).drivers.map((d) => [d.id, d.lineup])).toEqual([
      [10, true],
      [11, true],
      [12, false],
    ]);
    expect(teamProfile(data, MCLAREN).drivers.map((d) => [d.id, d.lineup])).toEqual([
      [12, true],
      [11, false],
    ]);
  });

  test("equipe com três pilotos tem um duelo por par que correu junto por ela, do par com mais Sessões juntos para o com menos", () => {
    const r1 = session(1, 1);
    const r2 = session(2, 2);
    const sprint = session(3, 3, true);
    const r3 = session(4, 3);
    const r4 = session(5, 4);
    const data = season(
      [],
      [r1, [result(r1, 10, FERRARI, 1), result(r1, 12, MCLAREN, 2), result(r1, 11, FERRARI, 3)]],
      [r2, [result(r2, 11, FERRARI, 1), result(r2, 10, FERRARI, 2)]],
      [sprint, [result(sprint, 10, FERRARI, 4), result(sprint, 11, FERRARI, 5)]],
      // O 12 entra na Ferrari no lugar do 11, que vai para a McLaren: os dois nunca correm juntos por ela.
      [r3, [result(r3, 12, FERRARI, 1), result(r3, 11, MCLAREN, 2), result(r3, 10, FERRARI, 6)]],
      [r4, [result(r4, 12, FERRARI, 1), result(r4, 10, FERRARI, 2), result(r4, 11, MCLAREN, 3)]],
    );

    const { drivers, duels } = teamProfile(data, FERRARI);

    expect(drivers.map((d) => [d.id, d.points])).toEqual([
      [10, 25 + 18 + 5 + 8 + 18],
      [12, 25 + 25],
      [11, 15 + 25 + 4],
    ]);
    expect(duels).toEqual([
      { drivers: [{ id: 10, ahead: 2 }, { id: 11, ahead: 1 }], sessions: 3 },
      { drivers: [{ id: 10, ahead: 0 }, { id: 12, ahead: 2 }], sessions: 2 },
    ]);
  });

  test("equipe sem Sessão disputada fica sem Pilotos da equipe e sem duelos, mesmo com Dupla no cadastro", () => {
    const race = session(1, 1);
    const data = season([], [race, [result(race, 10, FERRARI, 1), result(race, 20, MCLAREN, 2)]]);
    data.drivers = { 30: { id: 30, name: "Lucas", teamId: WILLIAMS } };

    const { drivers, duels } = teamProfile(data, WILLIAMS);

    expect(drivers).toEqual([]);
    expect(duels).toEqual([]);
    expect(teamProfile(season([]), WILLIAMS)).toMatchObject({ drivers: [], duels: [] });
  });

  test("piloto sozinho pela equipe não tem duelo", () => {
    const race = session(1, 1);
    const data = season([], [race, [result(race, 10, FERRARI, 1), result(race, 20, MCLAREN, 2)]]);

    expect(teamProfile(data, FERRARI).duels).toEqual([]);
  });
});

describe("Evolução dos construtores", () => {
  test("soma os pontos de cada equipe após cada Sessão, na ordem da classificação de construtores", () => {
    const ferrari = team(FERRARI, "Ferrari");
    const mclaren = team(MCLAREN, "McLaren");
    const sprint = session(10, 1, true);
    const race = session(11, 1);
    const race2 = session(12, 2);
    const data = season(
      [ferrari, mclaren],
      [sprint, [result(sprint, 100, FERRARI, 1), result(sprint, 200, MCLAREN, 2), result(sprint, 101, FERRARI, 3)]],
      [race, [result(race, 200, MCLAREN, 1), result(race, 201, MCLAREN, 2), result(race, 100, FERRARI, 3)]],
      [race2, [result(race2, 101, FERRARI, 1), result(race2, 100, FERRARI, 2), result(race2, 200, MCLAREN, 3)]],
    );

    const { sessions, series } = constructorsProgression(data);

    expect(sessions).toEqual([
      { label: "Teste 1", round: 1, isSprint: true },
      { label: "Teste 1", round: 1, isSprint: false },
      { label: "Teste 2", round: 2, isSprint: false },
    ]);
    expect(series.map((s) => [s.id, s.name, s.color, s.dashed])).toEqual([
      [1, "Ferrari", "var(--team-1)", false],
      [2, "McLaren", "var(--team-2)", false],
    ]);
    expect(series[0].cumulative).toEqual([14, 29, 72]);
    expect(series[1].cumulative).toEqual([7, 50, 65]);
  });

  test("empate em pontos é decidido pelas vitórias em Corridas", () => {
    const ferrari = team(FERRARI, "Ferrari");
    const mclaren = team(MCLAREN, "McLaren");
    const race = session(10, 1);
    const race2 = session(11, 2);
    const data = season(
      [ferrari, mclaren],
      // 25 a 25: a McLaren venceu a Corrida, a Ferrari não.
      [race, [result(race, 200, MCLAREN, 1), result(race, 100, FERRARI, 3), result(race, 101, FERRARI, 5)]],
      [race2, [result(race2, 100, FERRARI, 1)]],
    );

    const { series } = constructorsProgression(data);

    expect(series[0].cumulative).toEqual([25, 50]);
    expect(series[1].cumulative).toEqual([25, 25]);
    expect(series[0].positions).toEqual([2, 1]);
    expect(series[1].positions).toEqual([1, 2]);
  });

  test("empate em pontos e em vitórias é decidido pelos pódios, e vencer a Sprint não é vitória", () => {
    const ferrari = team(FERRARI, "Ferrari");
    const mclaren = team(MCLAREN, "McLaren");
    const sprint = session(10, 1, true);
    const race = session(11, 1);
    const data = season(
      [ferrari, mclaren],
      // 13 a 13 numa Sprint: a Ferrari venceu (1 pódio), a McLaren fez 2º e 3º (2 pódios).
      [
        sprint,
        [
          result(sprint, 100, FERRARI, 1),
          result(sprint, 200, MCLAREN, 2),
          result(sprint, 201, MCLAREN, 3),
          result(sprint, 101, FERRARI, 4),
        ],
      ],
      [race, [result(race, 100, FERRARI, 1)]],
    );

    const { series } = constructorsProgression(data);

    expect(series[0].cumulative).toEqual([13, 38]);
    expect(series[1].cumulative).toEqual([13, 13]);
    expect(series[0].positions).toEqual([2, 1]);
    expect(series[1].positions).toEqual([1, 2]);
  });

  test("empate em pontos, vitórias e pódios fica na ordem da classificação final", () => {
    const mclaren = team(MCLAREN, "McLaren");
    const ferrari = team(FERRARI, "Ferrari");
    const haas = team(HAAS, "Haas");
    const sprint = session(10, 1, true);
    const race = session(11, 1);
    const data = season(
      [mclaren, ferrari, haas],
      // Ferrari e McLaren: 11 pontos, nenhuma vitória e um pódio cada.
      [
        sprint,
        [
          result(sprint, 300, HAAS, 1),
          result(sprint, 100, FERRARI, 2),
          result(sprint, 200, MCLAREN, 3),
          result(sprint, 201, MCLAREN, 4),
          result(sprint, 101, FERRARI, 5),
        ],
      ],
      [race, [result(race, 200, MCLAREN, 1)]],
    );

    const { series } = constructorsProgression(data);

    expect(series.map((s) => s.name)).toEqual(["McLaren", "Ferrari", "Haas"]);
    expect(series.map((s) => s.cumulative)).toEqual([
      [11, 36],
      [11, 11],
      [8, 8],
    ]);
    expect(series.map((s) => s.positions)).toEqual([
      [1, 1],
      [2, 2],
      [3, 3],
    ]);
  });

  test("piloto que troca de equipe soma para a equipe registrada em cada resultado", () => {
    const ferrari = team(FERRARI, "Ferrari");
    const mclaren = team(MCLAREN, "McLaren");
    const race = session(10, 1);
    const race2 = session(11, 2);
    const data = season(
      [mclaren, ferrari],
      [race, [result(race, 100, FERRARI, 1), result(race, 200, MCLAREN, 2)]],
      // O piloto 100 passa para a McLaren, a equipe dele no cadastro.
      [race2, [result(race2, 100, MCLAREN, 1), result(race2, 101, FERRARI, 2)]],
    );
    data.drivers = {
      100: { id: 100, name: "Matheus", teamId: MCLAREN },
      101: { id: 101, name: "Gabriel", teamId: FERRARI },
      200: { id: 200, name: "Lucas", teamId: MCLAREN },
    };

    const { series } = constructorsProgression(data);

    expect(series.map((s) => [s.name, s.cumulative])).toEqual([
      ["McLaren", [18, 43]],
      ["Ferrari", [25, 43]],
    ]);
    expect(series.map((s) => s.positions)).toEqual([
      [2, 1],
      [1, 2],
    ]);
  });
});
