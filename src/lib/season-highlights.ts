// Líderes dos tiles de destaque da home, a partir do perfil de cada piloto na
// temporada (driver-season.ts).
import { driverProfile, type DriverProfile, type DriverSeasonData } from "./driver-season";

/** Líder(es) de um tile: o melhor valor e todos os pilotos empatados nele. */
export interface Leaders {
  /** O melhor valor; 0 quando ninguém pontuou no indicador. */
  value: number;
  /** Pilotos com esse valor, na ordem em que aparecem na temporada; vazio quando ninguém pontuou. */
  driverIds: number[];
}

export interface SeasonHighlights {
  /** Mais poles. */
  poles: Leaders;
  /** Mais voltas rápidas. */
  fastestLaps: Leaders;
  /** Maior Sequência de vitórias da temporada. */
  winStreak: Leaders;
  /** Melhor Forma recente: mini-ranking dos 3 primeiros. */
  recentForm: RecentFormEntry[];
  /**
   * Melhor Ritmo: o menor Ritmo (driver-season.ts) entre quem disputou ao menos
   * metade das Sessões disputadas da temporada; null quando ninguém se qualifica.
   */
  pace: Leaders | null;
  /** Melhor Aproveitamento, em pontos por Sessão, entre quem disputou ao menos metade das Sessões. */
  performance: Leaders;
}

/** Um piloto no mini-ranking da Forma recente. */
export interface RecentFormEntry {
  driverId: number;
  /** Pontos nas últimas 3 Etapas disputadas da temporada. */
  points: number;
}

/** Pilotos no mini-ranking da Forma recente. */
const RECENT_FORM_TOP = 3;

/** Líderes de cada tile de destaque da temporada. */
export function seasonHighlights(data: DriverSeasonData): SeasonHighlights {
  const profiles = driverIds(data).map((id) => ({ id, profile: driverProfile(data, id) }));
  // Melhor Ritmo e Melhor Aproveitamento exigem ao menos metade das Sessões.
  const regulars = withMinimumSessions(data, profiles);
  return {
    poles: leaders(profiles, (p) => p.stats.poles),
    fastestLaps: leaders(profiles, (p) => p.stats.fastestLaps),
    winStreak: leaders(profiles, (p) => p.streaks.win.best),
    recentForm: recentFormTop(profiles),
    pace: bestPace(regulars),
    performance: leaders(regulars, (p) => p.performance?.pointsPerSession ?? 0),
  };
}

/**
 * Os 3 pilotos com mais pontos na Forma recente, do maior para o menor; empatados
 * na ordem em que aparecem na temporada. Quem não pontuou na janela fica de fora.
 */
function recentFormTop(profiles: { id: number; profile: DriverProfile }[]): RecentFormEntry[] {
  return profiles
    .map(({ id, profile }) => ({ driverId: id, points: profile.stats.recentForm }))
    .filter((e) => e.points > 0)
    .sort((a, b) => b.points - a.points)
    .slice(0, RECENT_FORM_TOP);
}

/** Pilotos que disputaram ao menos metade das Sessões disputadas da temporada. */
function withMinimumSessions(
  data: DriverSeasonData,
  profiles: { id: number; profile: DriverProfile }[],
): { id: number; profile: DriverProfile }[] {
  const played = playedSessions(data);
  return profiles.filter(({ profile }) => profile.sessions.length * 2 >= played);
}

/** Pilotos com resultado na temporada, na ordem em que aparecem nas Sessões. */
function driverIds(data: DriverSeasonData): number[] {
  const ids = new Set<number>();
  for (const s of data.sessions) for (const r of data.results[s.id] ?? []) ids.add(r.driverId);
  return [...ids];
}

/** Pilotos com o maior valor positivo de `pick`, empatados juntos. */
function leaders(
  profiles: { id: number; profile: DriverProfile }[],
  pick: (profile: DriverProfile) => number,
): Leaders {
  const values = profiles.map(({ id, profile }) => ({ id, value: pick(profile) }));
  const value = Math.max(0, ...values.map((v) => v.value));
  if (value === 0) return { value, driverIds: [] };
  return { value, driverIds: values.filter((v) => v.value === value).map((v) => v.id) };
}

/** Sessões da temporada que já têm resultado. */
function playedSessions(data: DriverSeasonData): number {
  return data.sessions.filter((s) => (data.results[s.id] ?? []).length > 0).length;
}

/** Pilotos com o menor Ritmo, empatados juntos; null quando ninguém tem Ritmo. */
function bestPace(profiles: { id: number; profile: DriverProfile }[]): Leaders | null {
  const values = profiles.flatMap(({ id, profile }) =>
    profile.stats.pace === null ? [] : [{ id, value: profile.stats.pace }],
  );
  if (!values.length) return null;
  const value = Math.min(...values.map((v) => v.value));
  return { value, driverIds: values.filter((v) => v.value === value).map((v) => v.id) };
}
