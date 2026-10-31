// Contas das equipes numa temporada, a partir dos dados já carregados (não busca
// nada na API). A equipe de um resultado é a registrada naquele resultado, não a
// do cadastro do piloto: quem trocou de equipe conta para as duas, cada uma no
// seu período.
import type { ChartSeries, ChartSession } from "@/components/ProgressionChart";
import { chartSessions } from "./chart";
import type { SeasonData, Session } from "./season";

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

/** Uma Sessão disputada pela equipe. */
export interface TeamSession {
  session: Session;
  /** Pilotos que correram pela equipe na Sessão, em ordem de chegada. */
  drivers: { driverId: number; position: number }[];
  /** Pontos da equipe na Sessão. */
  points: number;
  /** Pontos acumulados pela equipe até esta Sessão, inclusive. */
  total: number;
}

export interface TeamProfile {
  stats: TeamStats;
  /** Sessões disputadas pela equipe, em ordem. */
  sessions: TeamSession[];
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
  return { stats, sessions: teamSessions(data, teamId) };
}

/** Sessões disputadas pela equipe, com os pontos dela em cada uma e o acumulado. */
function teamSessions(data: TeamSeasonData, teamId: number): TeamSession[] {
  const sessions: TeamSession[] = [];
  let total = 0;
  for (const session of data.sessions) {
    const own = (data.results[session.id] ?? []).filter((r) => r.teamId === teamId);
    if (!own.length) continue;
    const points = own.reduce((sum, r) => sum + r.points, 0);
    total += points;
    const drivers = own
      .map((r) => ({ driverId: r.driverId, position: r.position }))
      .sort((a, b) => a.position - b.position);
    sessions.push({ session, drivers, points, total });
  }
  return sessions;
}

/**
 * Evolução do campeonato de construtores: as Sessões e uma série por equipe, na
 * ordem da classificação de construtores, com os pontos acumulados e a posição
 * após cada Sessão.
 */
export function constructorsProgression(data: SeasonData): {
  sessions: ChartSession[];
  series: ChartSeries[];
} {
  const series: ChartSeries[] = data.teamStandings.map((st) => {
    const team = data.teams[st.team_id];
    return {
      id: st.team_id,
      name: team?.short ?? st.team_name,
      color: team?.color ?? "var(--team-other)",
      dashed: false,
      cumulative: [],
      positions: [],
    };
  });
  // Desempate da classificação de construtores: pontos, vitórias em Corridas,
  // pódios e, persistindo o empate, a ordem da classificação final.
  const tally = series.map((_, finalIndex) => ({ finalIndex, points: 0, wins: 0, podiums: 0 }));
  const indexOf = new Map(series.map((s, i) => [s.id, i]));

  data.sessions.forEach((session, i) => {
    for (const r of data.results[session.id] ?? []) {
      const t = indexOf.get(r.teamId);
      if (t === undefined) continue;
      tally[t].points += r.points;
      if (r.position === 1 && !session.isSprint) tally[t].wins += 1;
      if (r.position <= 3) tally[t].podiums += 1;
    }
    series.forEach((s, t) => s.cumulative.push(tally[t].points));
    const ranking = [...tally].sort(
      (a, b) =>
        b.points - a.points ||
        b.wins - a.wins ||
        b.podiums - a.podiums ||
        a.finalIndex - b.finalIndex,
    );
    ranking.forEach((t, pos) => (series[t.finalIndex].positions[i] = pos + 1));
  });

  return { sessions: chartSessions(data.sessions), series };
}
