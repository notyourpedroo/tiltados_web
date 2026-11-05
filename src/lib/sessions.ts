// Sessões e resultados a partir das respostas cruas da API (sem buscar nada), para
// season.ts e para o teste de sanidade com os retratos reais da API.
import { lapToMs } from "./lap";
import type { ApiRace, ApiResult } from "./types";

// Mesma tabela de files/{season}/scores.csv da API (igual em 2025 e 2026).
const RACE_POINTS = [25, 18, 15, 12, 10, 8];
const SPRINT_POINTS = [8, 7, 6, 5, 4, 3];

export function pointsFor(position: number, isSprint: boolean): number {
  return (isSprint ? SPRINT_POINTS : RACE_POINTS)[position - 1] ?? 0;
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

/**
 * Sessões em ordem cronológica (sprint antes da corrida) e os resultados de cada uma,
 * ordenados pela posição final e com a Volta mais rápida marcada.
 */
export function buildSessions(
  apiRaces: ApiRace[],
  apiResults: ApiResult[],
): { sessions: Session[]; results: Record<number, SessionResult[]> } {
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

  return { sessions, results };
}
