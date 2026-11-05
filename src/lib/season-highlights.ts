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
}

/** Líderes de cada tile de destaque da temporada. */
export function seasonHighlights(data: DriverSeasonData): SeasonHighlights {
  const profiles = driverIds(data).map((id) => ({ id, profile: driverProfile(data, id) }));
  return {
    poles: leaders(profiles, (p) => p.stats.poles),
    fastestLaps: leaders(profiles, (p) => p.stats.fastestLaps),
    winStreak: leaders(profiles, (p) => p.streaks.win.best),
  };
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
