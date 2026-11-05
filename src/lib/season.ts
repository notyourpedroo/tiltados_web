import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import {
  getDriverStandings,
  getDrivers,
  getPunishments,
  getRaces,
  getResults,
  getTeamStandings,
  getTeams,
} from "./api";
import { buildSessions, type Session, type SessionResult } from "./sessions";
import { teamStyle, type TeamLogo } from "./teams";
import { mainSession, weekends } from "./weekend";
import type {
  ApiDriverStanding,
  ApiPunishment,
  ApiTeamStanding,
  Season,
} from "./types";

export type { Session, SessionResult } from "./sessions";

export interface Team {
  id: number;
  name: string;
  short: string;
  color: string;
  logo?: TeamLogo;
}

export interface Driver {
  id: number;
  name: string;
  /** Equipe atual (a do cadastro de pilotos). */
  teamId: number;
}

export interface SeasonData {
  season: Season;
  teams: Record<number, Team>;
  drivers: Record<number, Driver>;
  /** Sessões disputadas, em ordem cronológica (sprint antes da corrida). */
  sessions: Session[];
  /** Resultados de cada sessão, ordenados pela posição final. */
  results: Record<number, SessionResult[]>;
  driverStandings: ApiDriverStanding[];
  teamStandings: ApiTeamStanding[];
  /**
   * Evolução de cada piloto após cada sessão (mesma ordem de `sessions`): pontos
   * acumulados e posição no campeonato naquele momento.
   */
  progression: { driverId: number; cumulative: number[]; positions: number[] }[];
  punishments: ApiPunishment[];
}

export async function getSeason(season: Season): Promise<SeasonData> {
  "use cache";
  cacheLife("minutes");
  cacheTag("tiltados-api");

  const [apiDrivers, apiTeams, apiRaces, apiResults, driverStandings, teamStandings, punishments] =
    await Promise.all([
      getDrivers(season),
      getTeams(season),
      getRaces(season),
      getResults(season),
      getDriverStandings(season),
      getTeamStandings(season),
      season === "2026" ? getPunishments() : Promise.resolve([]),
    ]);

  const teams: Record<number, Team> = {};
  for (const t of apiTeams) {
    teams[t.team_id] = { id: t.team_id, name: t.team_name, ...teamStyle(t.team_name) };
  }

  const drivers: Record<number, Driver> = {};
  for (const d of apiDrivers) {
    drivers[d.driver_id] = { id: d.driver_id, name: d.driver_name, teamId: d.team_id };
  }

  const { sessions, results } = buildSessions(apiRaces, apiResults);

  // Acumula pontos, vitórias em GP e pódios sessão a sessão; a posição em cada
  // momento usa o mesmo desempate da API (pontos, vitórias, pódios) e, persistindo
  // o empate (ex.: todos zerados no início), a ordem da classificação final.
  const progression = driverStandings.map((st) => ({
    driverId: st.driver_id,
    cumulative: [] as number[],
    positions: [] as number[],
  }));
  const tally = progression.map((_, finalIndex) => ({ finalIndex, points: 0, wins: 0, podiums: 0 }));
  sessions.forEach((s, i) => {
    progression.forEach((p, d) => {
      const r = results[s.id].find((res) => res.driverId === p.driverId);
      if (r) {
        tally[d].points += r.points;
        if (r.position === 1 && !s.isSprint) tally[d].wins += 1;
        if (r.position <= 3) tally[d].podiums += 1;
      }
      p.cumulative.push(tally[d].points);
    });
    const ranking = [...tally].sort(
      (a, b) =>
        b.points - a.points ||
        b.wins - a.wins ||
        b.podiums - a.podiums ||
        a.finalIndex - b.finalIndex,
    );
    ranking.forEach((t, pos) => (progression[t.finalIndex].positions[i] = pos + 1));
  });

  return {
    season,
    teams,
    drivers,
    sessions,
    results,
    driverStandings,
    teamStandings,
    progression,
    punishments,
  };
}

/** Sessões do mesmo fim de semana (sprint + corrida). */
export function weekendOf(data: SeasonData, session: Session): Session[] {
  return data.sessions.filter((s) => s.round === session.round);
}

/** A Corrida de cada Etapa (ou a Sprint, enquanto a Corrida está pendente). */
export function mainSessions(data: SeasonData): Session[] {
  return weekends(data.sessions).map(mainSession);
}
