// Contas das equipes numa temporada, a partir dos dados já carregados (não busca
// nada na API). A equipe de um resultado é a registrada naquele resultado, não a
// do cadastro do piloto: quem trocou de equipe conta para as duas, cada uma no
// seu período.
import type { ChartSeries, ChartSession } from "@/components/ProgressionChart";
import { chartSessions } from "./chart";
import type { SeasonData, Session } from "./season";

/** Dados da temporada de que o perfil da equipe precisa. */
export type TeamSeasonData = Pick<SeasonData, "sessions" | "results" | "drivers">;

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

/** Piloto da equipe: disputou ao menos uma Sessão por ela. */
export interface TeamDriver {
  id: number;
  /** Pontos que o piloto fez por esta equipe, e só por ela. */
  points: number;
  /** Da Dupla: a equipe do piloto no cadastro é esta. */
  inDupla: boolean;
}

/** Quem chegou na frente nas Sessões em que dois Pilotos da equipe correram juntos por ela. */
export interface TeamDuel {
  /** Os dois pilotos, na ordem da lista de Pilotos da equipe, com quantas vezes cada um chegou na frente. */
  drivers: [TeamDuelSide, TeamDuelSide];
  /** Sessões em que os dois correram pela equipe. */
  sessions: number;
}

export interface TeamDuelSide {
  id: number;
  ahead: number;
}

export interface TeamProfile {
  stats: TeamStats;
  /** Sessões disputadas pela equipe, em ordem. */
  sessions: TeamSession[];
  /** Pilotos da equipe, do maior pontuador para o menor. */
  drivers: TeamDriver[];
  /** Um duelo por par que correu junto, do par com mais Sessões juntos para o com menos. */
  duels: TeamDuel[];
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
  const drivers = teamDrivers(data, teamId);
  return {
    stats,
    sessions: teamSessions(data, teamId),
    drivers,
    duels: teamDuels(data, teamId, drivers),
  };
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

function teamDrivers(data: TeamSeasonData, teamId: number): TeamDriver[] {
  const byId = new Map<number, TeamDriver>();
  for (const s of data.sessions) {
    for (const r of data.results[s.id] ?? []) {
      if (r.teamId !== teamId) continue;
      const d = byId.get(r.driverId) ?? {
        id: r.driverId,
        points: 0,
        inDupla: data.drivers[r.driverId]?.teamId === teamId,
      };
      d.points += r.points;
      byId.set(r.driverId, d);
    }
  }
  return [...byId.values()].sort((a, b) => b.points - a.points);
}

function teamDuels(data: TeamSeasonData, teamId: number, drivers: TeamDriver[]): TeamDuel[] {
  const duels: TeamDuel[] = [];
  const pairs = new Map<string, TeamDuel>();
  drivers.forEach((a, i) =>
    drivers.slice(i + 1).forEach((b) => {
      const duel: TeamDuel = { drivers: [{ id: a.id, ahead: 0 }, { id: b.id, ahead: 0 }], sessions: 0 };
      pairs.set(`${a.id}-${b.id}`, duel);
      duels.push(duel);
    }),
  );
  const order = new Map(drivers.map((d, i) => [d.id, i]));
  for (const s of data.sessions) {
    const own = (data.results[s.id] ?? [])
      .filter((r) => r.teamId === teamId)
      .sort((a, b) => order.get(a.driverId)! - order.get(b.driverId)!);
    own.forEach((a, i) =>
      own.slice(i + 1).forEach((b) => {
        const duel = pairs.get(`${a.driverId}-${b.driverId}`)!;
        duel.sessions++;
        duel.drivers[a.position < b.position ? 0 : 1].ahead++;
      }),
    );
  }
  return duels.filter((d) => d.sessions > 0).sort((a, b) => b.sessions - a.sessions);
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
