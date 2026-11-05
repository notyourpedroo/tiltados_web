// Contas de um piloto numa temporada, a partir dos dados já carregados (não busca
// nada na API). Espelho do perfil da equipe (team-season.ts).
import { lapToMs } from "./lap";
import type { SeasonData, Session, SessionResult } from "./season";
import { recentFormSessions } from "./weekend";

/** Dados da temporada de que o perfil do piloto precisa. */
export type DriverSeasonData = Pick<SeasonData, "sessions" | "results">;

/** Uma Sessão disputada pelo piloto. */
export interface DriverSession {
  session: Session;
  result: SessionResult;
  /** Pontos acumulados pelo piloto até esta Sessão, inclusive. */
  total: number;
}

export interface DriverStats {
  /** Poles: largadas em 1º em Corridas (a Sprint não conta). */
  poles: number;
  /** Voltas mais rápidas, em Corridas e Sprints. */
  fastestLaps: number;
  /** Hat-tricks: Pole, vitória e Volta mais rápida na mesma Corrida. */
  hatTricks: number;
  /** Conversão de pole: das `poles`, quantas viraram vitória na mesma Corrida. */
  poleConversion: { converted: number; poles: number };
  /** Posição média de chegada em Corridas; null sem Corrida disputada. */
  avgFinish: number | null;
  /** Saldo de posições do grid à chegada, em Corridas e Sprints. */
  gained: number;
  /** Melhor posição do piloto numa Sessão; null sem Sessão disputada. */
  best: { position: number; count: number } | null;
  /** Forma recente: pontos nas últimas 3 Etapas disputadas da temporada, Corrida e Sprint somadas. */
  recentForm: number;
  /**
   * Ritmo: média, entre as Sessões em que o piloto marcou tempo, de quanto a melhor
   * volta dele fica atrás da Volta mais rápida da Sessão, em fração (0,012 = 1,2%);
   * null sem tempo válido.
   */
  pace: number | null;
}

/** Quem chegou na frente nas Sessões em que o piloto e um companheiro correram pela mesma equipe. */
export interface DriverDuel {
  /** O companheiro. */
  id: number;
  /** Sessões em que o piloto chegou na frente do companheiro. */
  ahead: number;
  /** Sessões em que o companheiro chegou na frente. */
  behind: number;
}

/** Uma Sequência: Corridas seguidas em que o piloto cumpriu o critério. */
export interface Streak {
  /** A maior da temporada. */
  best: number;
  /** A que chega à última Corrida disputada da temporada; 0 se ela quebrou ali. */
  current: number;
}

export interface DriverStreaks {
  /** Corridas seguidas pontuando. */
  scoring: Streak;
  /** Corridas seguidas no pódio. */
  podium: Streak;
  /** Corridas seguidas vencendo. */
  win: Streak;
}

/** Aproveitamento do piloto, sobre as Sessões que ele disputou. */
export interface DriverPerformance {
  /** Pontos por Sessão disputada. */
  pointsPerSession: number;
  /** Parte das Sessões disputadas em que pontuou, de 0 a 1. */
  scoringRate: number;
}

export interface DriverProfile {
  stats: DriverStats;
  /** Sequências de pontos, pódios e vitórias, só em Corridas. */
  streaks: DriverStreaks;
  /** Aproveitamento; null sem Sessão disputada. */
  performance: DriverPerformance | null;
  /** Sessões disputadas pelo piloto, em ordem. */
  sessions: DriverSession[];
  /** Um duelo por companheiro, na ordem em que correram juntos pela primeira vez. */
  duels: DriverDuel[];
}

/** Perfil do piloto na temporada. */
export function driverProfile(data: DriverSeasonData, driverId: number): DriverProfile {
  const sessions: DriverSession[] = [];
  let total = 0;
  for (const session of data.sessions) {
    const result = (data.results[session.id] ?? []).find((r) => r.driverId === driverId);
    if (!result) continue;
    total += result.points;
    sessions.push({ session, result, total });
  }
  const results = sessions.map((s) => s.result);
  const races = sessions.filter((s) => !s.session.isSprint).map((s) => s.result);
  const poles = races.filter((r) => r.grid === 1);
  const converted = poles.filter((r) => r.position === 1);
  const stats: DriverStats = {
    poles: poles.length,
    fastestLaps: results.filter((r) => r.fastestLap).length,
    hatTricks: converted.filter((r) => r.fastestLap).length,
    poleConversion: { converted: converted.length, poles: poles.length },
    avgFinish: races.length ? races.reduce((sum, r) => sum + r.position, 0) / races.length : null,
    gained: results.reduce((sum, r) => sum + r.gained, 0),
    best: bestResult(results),
    recentForm: recentForm(data, sessions),
    pace: pace(data, sessions),
  };
  return {
    stats,
    streaks: driverStreaks(data, driverId),
    performance: driverPerformance(results),
    sessions,
    duels: driverDuels(data, driverId, sessions),
  };
}

/** Médias por Sessão de um piloto numa temporada, para comparar temporadas (nunca totais). */
export interface SeasonAverages {
  /** Pontos por Sessão disputada. */
  pointsPerSession: number;
  /** Parte das Corridas disputadas que venceu, de 0 a 1; null sem Corrida. */
  raceWinRate: number | null;
  /** Parte das Sessões disputadas em que chegou no pódio, de 0 a 1. */
  podiumRate: number;
  /** Chegada média em Corridas; null sem Corrida. */
  avgFinish: number | null;
  /** Ritmo; null sem tempo válido. */
  pace: number | null;
}

/**
 * Comparativo da temporada atual até agora com a Temporada passada inteira, a
 * partir dos perfis do mesmo piloto nas duas. null quando ele não tem Sessão
 * disputada em alguma delas.
 */
export function seasonComparison(
  current: DriverProfile,
  previous: DriverProfile,
): { current: SeasonAverages; previous: SeasonAverages } | null {
  const now = seasonAverages(current);
  const before = seasonAverages(previous);
  return now && before ? { current: now, previous: before } : null;
}

function seasonAverages({ stats, performance, sessions }: DriverProfile): SeasonAverages | null {
  if (!performance) return null;
  const races = sessions.filter((s) => !s.session.isSprint);
  return {
    pointsPerSession: performance.pointsPerSession,
    raceWinRate: races.length ? races.filter((s) => s.result.position === 1).length / races.length : null,
    podiumRate: sessions.filter((s) => s.result.position <= 3).length / sessions.length,
    avgFinish: stats.avgFinish,
    pace: stats.pace,
  };
}

/**
 * Sequências sobre as Corridas disputadas da temporada, em ordem: Sprints não
 * contam, e uma Corrida sem o piloto quebra a corrente.
 */
function driverStreaks(data: DriverSeasonData, driverId: number): DriverStreaks {
  const races = data.sessions
    .filter((s) => !s.isSprint)
    .map((s) => data.results[s.id] ?? [])
    .filter((list) => list.length > 0)
    .map((list) => list.find((r) => r.driverId === driverId));
  const streak = (hit: (r: SessionResult) => boolean): Streak => {
    let best = 0;
    let current = 0;
    for (const r of races) {
      current = r && hit(r) ? current + 1 : 0;
      best = Math.max(best, current);
    }
    return { best, current };
  };
  return {
    scoring: streak((r) => r.points > 0),
    podium: streak((r) => r.position <= 3),
    win: streak((r) => r.position === 1),
  };
}

function driverDuels(data: DriverSeasonData, driverId: number, sessions: DriverSession[]): DriverDuel[] {
  const byId = new Map<number, DriverDuel>();
  for (const { session, result } of sessions) {
    for (const other of data.results[session.id] ?? []) {
      if (other.driverId === driverId || other.teamId !== result.teamId) continue;
      const duel = byId.get(other.driverId) ?? { id: other.driverId, ahead: 0, behind: 0 };
      if (result.position < other.position) duel.ahead++;
      else duel.behind++;
      byId.set(other.driverId, duel);
    }
  }
  return [...byId.values()];
}

/** Pontos do piloto nas Sessões da janela da Forma recente; a Etapa sem ele conta zero. */
function recentForm(data: DriverSeasonData, sessions: DriverSession[]): number {
  const window = new Set(recentFormSessions(data.sessions).map((s) => s.id));
  return sessions.reduce((sum, s) => (window.has(s.session.id) ? sum + s.result.points : sum), 0);
}

function driverPerformance(results: SessionResult[]): DriverPerformance | null {
  if (!results.length) return null;
  const points = results.reduce((sum, r) => sum + r.points, 0);
  return {
    pointsPerSession: points / results.length,
    scoringRate: results.filter((r) => r.points > 0).length / results.length,
  };
}

function bestResult(results: SessionResult[]): DriverStats["best"] {
  if (!results.length) return null;
  const position = Math.min(...results.map((r) => r.position));
  return { position, count: results.filter((r) => r.position === position).length };
}

function pace(data: DriverSeasonData, sessions: DriverSession[]): number | null {
  const gaps: number[] = [];
  for (const { session, result } of sessions) {
    const lap = lapToMs(result.bestLap);
    if (lap === null) continue;
    const laps = (data.results[session.id] ?? []).map((r) => lapToMs(r.bestLap) ?? Infinity);
    const fastest = Math.min(...laps);
    if (fastest <= 0) continue;
    gaps.push((lap - fastest) / fastest);
  }
  return gaps.length ? gaps.reduce((sum, g) => sum + g, 0) / gaps.length : null;
}
