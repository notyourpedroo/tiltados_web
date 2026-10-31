// Contas das equipes numa temporada, a partir dos dados já carregados (não busca
// nada na API). A equipe de um resultado é a registrada naquele resultado, não a
// do cadastro do piloto: quem trocou de equipe conta para as duas.
import type { SeasonData } from "./season";

/** Dados da temporada de que o perfil da equipe precisa. */
export type TeamSeasonData = Pick<SeasonData, "sessions" | "results">;

export interface TeamStats {
  points: number;
  /** Vitórias em Corridas. */
  wins: number;
  /** 1º e 2º de uma Corrida com pilotos da equipe. */
  oneTwos: number;
  /** Pódios dos pilotos da equipe, em Corridas e Sprints. */
  podiums: number;
  /** Largadas em 1º, em Corridas e Sprints. */
  poles: number;
  /** Voltas mais rápidas, em Corridas e Sprints. */
  fastestLaps: number;
  /** Melhor posição de um piloto da equipe numa Sessão; null sem Sessão disputada. */
  best: { position: number; count: number } | null;
  /** Sessões em que dois pilotos da equipe pontuaram. */
  bothScored: number;
}

export interface TeamProfile {
  stats: TeamStats;
}

/** Perfil da equipe na temporada. */
export function teamProfile(data: TeamSeasonData, teamId: number): TeamProfile {
  const stats: TeamStats = {
    points: 0,
    wins: 0,
    oneTwos: 0,
    podiums: 0,
    poles: 0,
    fastestLaps: 0,
    best: null,
    bothScored: 0,
  };
  for (const s of data.sessions) {
    const own = (data.results[s.id] ?? []).filter((r) => r.teamId === teamId);
    for (const r of own) {
      stats.points += r.points;
      if (r.position <= 3) stats.podiums++;
      if (r.grid === 1) stats.poles++;
      if (r.fastestLap) stats.fastestLaps++;
      if (!stats.best || r.position < stats.best.position) {
        stats.best = { position: r.position, count: 1 };
      } else if (r.position === stats.best.position) {
        stats.best.count++;
      }
    }
    if (own.filter((r) => r.points > 0).length >= 2) stats.bothScored++;
    if (s.isSprint) continue;
    const has = (position: number) => own.some((r) => r.position === position);
    if (has(1)) stats.wins++;
    if (has(1) && has(2)) stats.oneTwos++;
  }
  return { stats };
}
