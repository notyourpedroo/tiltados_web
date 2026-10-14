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
import { teamStyle, type TeamLogo } from "./teams";
import type {
  ApiDriverStanding,
  ApiPunishment,
  ApiTeamStanding,
  Season,
} from "./types";

// Mesma tabela de files/{season}/scores.csv da API (igual em 2025 e 2026).
const RACE_POINTS = [25, 18, 15, 12, 10, 8];
const SPRINT_POINTS = [8, 7, 6, 5, 4, 3];

export function pointsFor(position: number, isSprint: boolean): number {
  return (isSprint ? SPRINT_POINTS : RACE_POINTS)[position - 1] ?? 0;
}

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

export interface Session {
  id: number;
  name: string;
  /** Nome do GP sem o sufixo "(SPRINT)". */
  gpName: string;
  date: string;
  location: string;
  isSprint: boolean;
  /** Número da etapa (fim de semana), começando em 1. */
  round: number;
}

export interface SessionResult {
  driverId: number;
  teamId: number;
  position: number;
  grid: number;
  /** Posições ganhas (positivo) ou perdidas (negativo) em relação ao grid. */
  gained: number;
  bestLap: string;
  fastestLap: boolean;
  points: number;
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

function lapToMs(lap: string): number | null {
  const m = /^(?:(\d+):)?(\d+(?:\.\d+)?)$/.exec(lap.trim());
  if (!m) return null;
  return (Number(m[1] ?? 0) * 60 + Number(m[2])) * 1000;
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

  // A API já devolve em ordem cronológica; a ordenação estável só garante isso.
  const ordered = apiRaces
    .map((r, i) => ({ r, i }))
    .sort(
      (a, b) =>
        a.r.race_date.localeCompare(b.r.race_date) ||
        Number(b.r.is_sprint) - Number(a.r.is_sprint) ||
        a.i - b.i,
    )
    .map(({ r }) => r);

  const weekendRound = new Map<string, number>();
  const sessions: Session[] = ordered.map((r) => {
    const gpName = r.race_name.replace(/\s*\(SPRINT\)\s*$/i, "");
    const key = `${gpName}|${r.race_date}`;
    if (!weekendRound.has(key)) weekendRound.set(key, weekendRound.size + 1);
    return {
      id: r.race_id,
      name: r.race_name,
      gpName,
      date: r.race_date,
      location: r.race_location,
      isSprint: r.is_sprint,
      round: weekendRound.get(key)!,
    };
  });

  const sprintById = new Map(sessions.map((s) => [s.id, s.isSprint]));
  const results: Record<number, SessionResult[]> = {};
  for (const s of sessions) results[s.id] = [];
  for (const r of apiResults) {
    const isSprint = sprintById.get(r.race_id);
    if (isSprint === undefined) continue;
    results[r.race_id].push({
      driverId: r.driver_id,
      teamId: r.team_id,
      position: r.driver_final_position,
      grid: r.driver_start_position,
      gained: r.driver_start_position - r.driver_final_position,
      bestLap: r.driver_fastest_lap,
      fastestLap: false,
      points: pointsFor(r.driver_final_position, isSprint),
    });
  }
  for (const list of Object.values(results)) {
    list.sort((a, b) => a.position - b.position);
    let best: SessionResult | null = null;
    let bestMs = Infinity;
    for (const res of list) {
      const ms = lapToMs(res.bestLap);
      if (ms !== null && ms < bestMs) {
        bestMs = ms;
        best = res;
      }
    }
    if (best) best.fastestLap = true;
  }

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

/** Corrida principal de cada etapa (ou a sprint, se a etapa só teve sprint). */
export function mainSessions(data: SeasonData): Session[] {
  const byRound = new Map<number, Session>();
  for (const s of data.sessions) {
    const cur = byRound.get(s.round);
    if (!cur || (cur.isSprint && !s.isSprint)) byRound.set(s.round, s);
  }
  return [...byRound.values()];
}
