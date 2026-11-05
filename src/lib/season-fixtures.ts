// Temporadas montadas à mão para os testes das contas sobre os dados da temporada
// (perfil da equipe, perfil do piloto, destaques da home). Só os testes importam.
import type { SeasonData, Session, SessionResult, Team } from "./season";

const RACE_POINTS = [25, 18, 15, 12, 10, 8];
const SPRINT_POINTS = [8, 7, 6, 5, 4, 3];

export function team(id: number, name: string): Team {
  return { id, name, short: name, color: `var(--team-${id})` };
}

export function session(id: number, round: number, isSprint = false): Session {
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
export function result(
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
export function season(teams: Team[], ...entries: [Session, SessionResult[]][]): SeasonData {
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
