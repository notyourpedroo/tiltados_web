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
  winSequencia: Leaders;
  /** Melhor Forma recente: mini-ranking dos 3 primeiros. */
  recentForm: RecentFormEntry[];
  /**
   * Melhor Ritmo: o menor Ritmo (driver-season.ts) entre quem disputou ao menos
   * metade das Sessões disputadas da temporada; null quando ninguém se qualifica.
   */
  ritmo: Leaders | null;
  /** Melhor Aproveitamento, em pontos por Sessão, entre quem disputou ao menos metade das Sessões. */
  performance: Leaders;
  /** Mais Hat-tricks; null quando ninguém fez um (o tile não aparece). */
  hatTricks: Leaders | null;
}

/** Um piloto no mini-ranking da Forma recente. */
export interface RecentFormEntry {
  driverId: number;
  /** Pontos nas últimas 3 Etapas disputadas da temporada. */
  points: number;
}

/** Pilotos no mini-ranking da Forma recente. */
const RECENT_FORM_TOP = 3;

/** Um piloto da temporada com o seu perfil. */
interface DriverEntry {
  id: number;
  profile: DriverProfile;
}

/** Tile sem líder: ninguém pontuou no indicador. */
const NONE: Leaders = { value: 0, driverIds: [] };

/** Líderes de cada tile de destaque da temporada. */
export function seasonHighlights(data: DriverSeasonData): SeasonHighlights {
  const profiles = driverIds(data).map((id) => ({ id, profile: driverProfile(data, id) }));
  // Melhor Ritmo e Melhor Aproveitamento exigem ao menos metade das Sessões.
  const regulars = withMinimumSessions(data, profiles);
  return {
    poles: leaders(profiles, (p) => p.stats.poles) ?? NONE,
    fastestLaps: leaders(profiles, (p) => p.stats.fastestLaps) ?? NONE,
    winSequencia: leaders(profiles, (p) => p.sequencias.win.best) ?? NONE,
    recentForm: recentFormTop(profiles),
    ritmo: leaders(regulars, (p) => p.stats.ritmo, "lowest"),
    performance: leaders(regulars, (p) => p.performance?.pointsPerSession ?? null) ?? NONE,
    hatTricks: leaders(profiles, (p) => p.stats.hatTricks),
  };
}

/**
 * Os 3 pilotos com mais pontos na Forma recente, do maior para o menor; empatados
 * na ordem em que aparecem na temporada. Quem não pontuou na janela fica de fora.
 */
function recentFormTop(profiles: DriverEntry[]): RecentFormEntry[] {
  return profiles
    .map(({ id, profile }) => ({ driverId: id, points: profile.stats.recentForm }))
    .filter((e) => e.points > 0)
    .sort((a, b) => b.points - a.points)
    .slice(0, RECENT_FORM_TOP);
}

/**
 * Parte mínima das Sessões disputadas da temporada que um piloto precisa ter disputado
 * para entrar em Melhor Ritmo e Melhor Aproveitamento. O texto dos tooltips desses
 * cards (indicators.ts) diz o mesmo corte, e o indicators.test.ts confere os dois.
 */
export const MINIMUM_SESSIONS_SHARE = 1 / 2;

/**
 * Se um piloto que disputou `disputed` Sessões entra em Melhor Ritmo e Melhor
 * Aproveitamento, numa temporada com `played` Sessões disputadas.
 */
function hasMinimumSessions(disputed: number, played: number): boolean {
  return disputed >= played * MINIMUM_SESSIONS_SHARE;
}

/** Pilotos que disputaram ao menos a parte mínima das Sessões disputadas da temporada. */
function withMinimumSessions(data: DriverSeasonData, profiles: DriverEntry[]): DriverEntry[] {
  const played = playedSessions(data);
  return profiles.filter(({ profile }) => hasMinimumSessions(profile.sessions.length, played));
}

/** Pilotos com resultado na temporada, na ordem em que aparecem nas Sessões. */
function driverIds(data: DriverSeasonData): number[] {
  const ids = new Set<number>();
  for (const s of data.sessions) for (const r of data.results[s.id] ?? []) ids.add(r.driverId);
  return [...ids];
}

/**
 * Pilotos com o melhor valor de `pick`, o maior ou o menor, empatados juntos;
 * null quando ninguém tem valor. `pick` devolve null para quem não tem valor e,
 * quando o melhor é o maior, só valores positivos contam (zero é não ter pontuado).
 */
function leaders(
  profiles: DriverEntry[],
  pick: (profile: DriverProfile) => number | null,
  best: "highest" | "lowest" = "highest",
): Leaders | null {
  const values = profiles.flatMap(({ id, profile }) => {
    const value = pick(profile);
    return value === null || (best === "highest" && value <= 0) ? [] : [{ id, value }];
  });
  if (!values.length) return null;
  const all = values.map((v) => v.value);
  const value = best === "highest" ? Math.max(...all) : Math.min(...all);
  return { value, driverIds: values.filter((v) => v.value === value).map((v) => v.id) };
}

/** Sessões da temporada que já têm resultado. */
function playedSessions(data: DriverSeasonData): number {
  return data.sessions.filter((s) => (data.results[s.id] ?? []).length > 0).length;
}
