// Contas de um piloto numa temporada, a partir dos dados já carregados (não busca
// nada na API). Espelho do perfil da equipe (team-season.ts).
import type { SeasonData, Session, SessionResult } from "./season";

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
  /** Posição média de chegada em Corridas; null sem Corrida disputada. */
  avgFinish: number | null;
  /** Saldo de posições do grid à chegada, em Corridas e Sprints. */
  gained: number;
  /** Melhor posição do piloto numa Sessão; null sem Sessão disputada. */
  best: { position: number; count: number } | null;
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

export interface DriverProfile {
  stats: DriverStats;
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
  const stats: DriverStats = {
    poles: races.filter((r) => r.grid === 1).length,
    fastestLaps: results.filter((r) => r.fastestLap).length,
    avgFinish: races.length ? races.reduce((sum, r) => sum + r.position, 0) / races.length : null,
    gained: results.reduce((sum, r) => sum + r.gained, 0),
    best: bestResult(results),
  };
  return { stats, sessions, duels: driverDuels(data, driverId, sessions) };
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

function bestResult(results: SessionResult[]): DriverStats["best"] {
  if (!results.length) return null;
  const position = Math.min(...results.map((r) => r.position));
  return { position, count: results.filter((r) => r.position === position).length };
}
