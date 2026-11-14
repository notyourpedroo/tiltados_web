// Contas de um piloto numa temporada, a partir dos dados já carregados (não busca
// nada na API). Espelho do perfil da equipe (team-season.ts).
import { decimal, percent } from "./format";
import { lapToMs } from "./lap";
import type { SeasonData, Session, SessionResult } from "./season";
import type { Season } from "./types";
import { recentFormSessions } from "./weekend";

/** Dados da temporada de que o perfil do piloto precisa. */
export type DriverSeasonData = Pick<SeasonData, "sessions" | "results">;

/** Uma Sessão disputada pelo piloto. */
export interface DriverSession {
  session: Session;
  result: SessionResult;
  /** Pontos acumulados pelo piloto até esta Sessão, inclusive. */
  total: number;
}

export interface DriverStats {
  /** Poles: largadas em 1º em Corridas (a Sprint não conta). */
  poles: number;
  /** Voltas mais rápidas, em Corridas e Sprints. */
  fastestLaps: number;
  /** Hat-tricks: Pole, vitória e Volta mais rápida na mesma Corrida. */
  hatTricks: number;
  /** Conversão de pole: das `poles`, quantas viraram vitória na mesma Corrida. */
  poleConversion: { converted: number; poles: number };
  /** Posição média de chegada em Corridas; null sem Corrida disputada. */
  avgFinish: number | null;
  /** Saldo de posições do grid à chegada, em Corridas e Sprints. */
  gained: number;
  /** Melhor posição do piloto numa Sessão; null sem Sessão disputada. */
  best: { position: number; count: number } | null;
  /** Forma recente: pontos nas últimas 3 Etapas disputadas da temporada, Corrida e Sprint somadas. */
  recentForm: number;
  /**
   * Ritmo: média, entre as Sessões em que o piloto marcou tempo, de quanto a melhor
   * volta dele fica atrás da Volta mais rápida da Sessão, em fração (0,012 = 1,2%);
   * null sem tempo válido.
   */
  ritmo: number | null;
}

/** Quem chegou na frente nas Sessões em que o piloto e um companheiro correram pela mesma equipe. */
export interface DriverDuel {
  /** O companheiro. */
  id: number;
  /** Sessões em que o piloto chegou na frente do companheiro. */
  ahead: number;
  /** Sessões em que o companheiro chegou na frente. */
  behind: number;
}

/** Uma Sequência: Corridas seguidas em que o piloto cumpriu o critério. */
export interface Sequencia {
  /** A maior da temporada. */
  best: number;
  /** A que chega à última Corrida disputada da temporada; 0 se ela quebrou ali. */
  current: number;
}

export interface DriverSequencias {
  /** Corridas seguidas pontuando. */
  scoring: Sequencia;
  /** Corridas seguidas no pódio. */
  podium: Sequencia;
  /** Corridas seguidas vencendo. */
  win: Sequencia;
}

/** Aproveitamento do piloto, sobre as Sessões que ele disputou. */
export interface DriverPerformance {
  /** Pontos por Sessão disputada. */
  pointsPerSession: number;
  /** Parte das Sessões disputadas em que pontuou, de 0 a 1. */
  scoringRate: number;
}

export interface DriverProfile {
  stats: DriverStats;
  /** Sequências de pontos, pódios e vitórias, só em Corridas. */
  sequencias: DriverSequencias;
  /** Aproveitamento; null sem Sessão disputada. */
  performance: DriverPerformance | null;
  /** Sessões disputadas pelo piloto, em ordem. */
  sessions: DriverSession[];
  /** Um duelo por companheiro, na ordem em que correram juntos pela primeira vez. */
  duels: DriverDuel[];
}

/** Pole: largada em 1º numa Corrida; a Sprint não conta. */
export function isPole(session: Session, result: SessionResult): boolean {
  return result.grid === 1 && !session.isSprint;
}

/** Perfil do piloto na temporada. */
export function driverProfile(data: DriverSeasonData, driverId: number): DriverProfile {
  const sessions: DriverSession[] = [];
  let total = 0;
  for (const session of data.sessions) {
    const result = (data.results[session.id] ?? []).find((r) => r.driverId === driverId);
    if (!result) continue;
    total += result.points;
    sessions.push({ session, result, total });
  }
  const results = sessions.map((s) => s.result);
  const races = sessions.filter((s) => !s.session.isSprint).map((s) => s.result);
  const poles = sessions.filter((s) => isPole(s.session, s.result)).map((s) => s.result);
  const converted = poles.filter((r) => r.position === 1);
  const stats: DriverStats = {
    poles: poles.length,
    fastestLaps: results.filter((r) => r.fastestLap).length,
    hatTricks: converted.filter((r) => r.fastestLap).length,
    poleConversion: { converted: converted.length, poles: poles.length },
    avgFinish: races.length ? races.reduce((sum, r) => sum + r.position, 0) / races.length : null,
    gained: results.reduce((sum, r) => sum + r.gained, 0),
    best: bestResult(results),
    recentForm: recentForm(data, sessions),
    ritmo: ritmo(data, sessions),
  };
  return {
    stats,
    sequencias: driverSequencias(data, driverId),
    performance: driverPerformance(results),
    sessions,
    duels: driverDuels(data, driverId, sessions),
  };
}

/** Médias por Sessão de um piloto numa temporada, para comparar temporadas (nunca totais). */
export interface SeasonAverages {
  /** Pontos por Sessão disputada. */
  pointsPerSession: number;
  /** Parte das Corridas disputadas que venceu, de 0 a 1; null sem Corrida. */
  raceWinRate: number | null;
  /** Parte das Sessões disputadas em que chegou no pódio, de 0 a 1. */
  podiumRate: number;
  /** Chegada média em Corridas; null sem Corrida. */
  avgFinish: number | null;
  /** Ritmo; null sem tempo válido. */
  ritmo: number | null;
}

/** Perfil do piloto numa Temporada anterior, entrada do comparativo. */
export interface PreviousSeasonProfile {
  /** Temporada, ex.: "2025". */
  season: Season;
  profile: DriverProfile;
}

/** Médias do piloto numa Temporada anterior. */
export interface PreviousSeasonAverages {
  /** Temporada, ex.: "2025". */
  season: Season;
  averages: SeasonAverages;
}

/** Uma célula do Comparativo: a média de uma Temporada como aparece na tela. */
export interface ComparisonCell {
  /** Temporada, ex.: "2025". */
  season: Season;
  /** Texto exibido; "—" quando a média não tem valor. */
  text: string;
  /** Melhor valor da linha entre as Temporadas exibidas; o negrito da tela. */
  best: boolean;
}

/** Evolução da temporada atual contra a Temporada anterior mais recente disputada. */
export type ComparisonTrend = "melhor" | "pior" | "igual";

/** Uma linha do Comparativo, pronta para exibir. */
export interface ComparisonRow {
  label: string;
  /** Uma célula por Temporada: as anteriores em ordem cronológica e a atual por último. */
  cells: ComparisonCell[];
  /** null quando a atual ou a referência não têm valor. */
  trend: ComparisonTrend | null;
}

/** Comparativo da temporada atual com as Temporadas anteriores do piloto. */
export interface SeasonComparisonData {
  /** Temporadas das colunas: as anteriores disputadas em ordem cronológica e a atual por último. */
  seasons: Season[];
  rows: ComparisonRow[];
}

interface RowDefinition {
  label: string;
  value: (a: SeasonAverages) => number | null;
  format: (n: number) => string;
  /** Maior é melhor (pontos, vitórias, pódios) ou menor é melhor (chegada, Ritmo). */
  higherIsBetter: boolean;
}

const COMPARISON_ROWS: RowDefinition[] = [
  {
    label: "Pontos por sessão",
    value: (a) => a.pointsPerSession,
    format: (n) => decimal(n),
    higherIsBetter: true,
  },
  {
    label: "Vitórias em corridas",
    value: (a) => a.raceWinRate,
    format: (n) => percent(n, 0),
    higherIsBetter: true,
  },
  {
    label: "Pódios",
    value: (a) => a.podiumRate,
    format: (n) => percent(n, 0),
    higherIsBetter: true,
  },
  {
    label: "Chegada média",
    value: (a) => a.avgFinish,
    format: (n) => decimal(n),
    higherIsBetter: false,
  },
  { label: "Ritmo", value: (a) => a.ritmo, format: (n) => percent(n), higherIsBetter: false },
];

/**
 * Comparativo da temporada atual até agora com as Temporadas anteriores inteiras,
 * a partir dos perfis do mesmo piloto em cada uma, em ordem cronológica. As
 * Temporadas anteriores sem Sessão disputada por ele ficam de fora. null quando
 * ele não tem Sessão disputada na atual ou em nenhuma Temporada anterior.
 */
export function seasonComparison(
  season: Season,
  current: DriverProfile,
  previous: PreviousSeasonProfile[],
): SeasonComparisonData | null {
  const now = seasonAverages(current);
  const played = previous.flatMap((p) => {
    const averages = seasonAverages(p.profile);
    return averages ? [{ season: p.season, averages }] : [];
  });
  const reference = played.at(-1);
  if (!now || !reference) return null;
  const columns: PreviousSeasonAverages[] = [...played, { season, averages: now }];
  return {
    seasons: columns.map((c) => c.season),
    rows: COMPARISON_ROWS.map((row) => {
      const text = (a: SeasonAverages) => {
        const value = row.value(a);
        return value === null ? "—" : row.format(value);
      };
      const best = bestValues(
        row,
        columns.map((c) => row.value(c.averages)),
      );
      return {
        label: row.label,
        cells: columns.map((c, i) => ({
          season: c.season,
          text: text(c.averages),
          best: best[i],
        })),
        trend: comparisonTrend(row, row.value(reference.averages), row.value(now)),
      };
    }),
  };
}

/**
 * Quais valores da linha são o melhor entre as Temporadas exibidas, comparando
 * como aparecem na tela. Os sem valor ficam fora; nenhum é o melhor com menos
 * de dois valores ou com a linha toda igual.
 */
function bestValues(row: RowDefinition, values: (number | null)[]): boolean[] {
  const present = values.filter((v) => v !== null);
  const texts = new Set(present.map(row.format));
  if (present.length < 2 || texts.size < 2) return values.map(() => false);
  const sign = row.higherIsBetter ? 1 : -1;
  const top = row.format(sign * Math.max(...present.map((v) => sign * v)));
  return values.map((v) => v !== null && row.format(v) === top);
}

/** Melhora ou piora, comparando os valores como aparecem na tela. */
function comparisonTrend(
  row: RowDefinition,
  before: number | null,
  now: number | null,
): ComparisonTrend | null {
  if (before === null || now === null) return null;
  if (row.format(before) === row.format(now)) return "igual";
  const better = row.higherIsBetter ? now > before : now < before;
  return better ? "melhor" : "pior";
}

function seasonAverages({ stats, performance, sessions }: DriverProfile): SeasonAverages | null {
  if (!performance) return null;
  const races = sessions.filter((s) => !s.session.isSprint);
  return {
    pointsPerSession: performance.pointsPerSession,
    raceWinRate: races.length
      ? races.filter((s) => s.result.position === 1).length / races.length
      : null,
    podiumRate: sessions.filter((s) => s.result.position <= 3).length / sessions.length,
    avgFinish: stats.avgFinish,
    ritmo: stats.ritmo,
  };
}

/**
 * Sequências sobre as Corridas disputadas da temporada, em ordem: Sprints não
 * contam, e uma Corrida sem o piloto quebra a corrente.
 */
function driverSequencias(data: DriverSeasonData, driverId: number): DriverSequencias {
  const races = data.sessions
    .filter((s) => !s.isSprint)
    .map((s) => data.results[s.id] ?? [])
    .filter((list) => list.length > 0)
    .map((list) => list.find((r) => r.driverId === driverId));
  const sequencia = (hit: (r: SessionResult) => boolean): Sequencia => {
    let best = 0;
    let current = 0;
    for (const r of races) {
      current = r && hit(r) ? current + 1 : 0;
      best = Math.max(best, current);
    }
    return { best, current };
  };
  return {
    scoring: sequencia((r) => r.points > 0),
    podium: sequencia((r) => r.position <= 3),
    win: sequencia((r) => r.position === 1),
  };
}

function driverDuels(
  data: DriverSeasonData,
  driverId: number,
  sessions: DriverSession[],
): DriverDuel[] {
  const byId = new Map<number, DriverDuel>();
  for (const { session, result } of sessions) {
    for (const other of data.results[session.id] ?? []) {
      if (other.driverId === driverId || other.teamId !== result.teamId) continue;
      const duel = byId.get(other.driverId) ?? { id: other.driverId, ahead: 0, behind: 0 };
      if (result.position < other.position) duel.ahead++;
      else duel.behind++;
      byId.set(other.driverId, duel);
    }
  }
  return [...byId.values()];
}

/** Pontos do piloto nas Sessões da janela da Forma recente; a Etapa sem ele conta zero. */
function recentForm(data: DriverSeasonData, sessions: DriverSession[]): number {
  const window = new Set(recentFormSessions(data.sessions).map((s) => s.id));
  return sessions.reduce((sum, s) => (window.has(s.session.id) ? sum + s.result.points : sum), 0);
}

function driverPerformance(results: SessionResult[]): DriverPerformance | null {
  if (!results.length) return null;
  const points = results.reduce((sum, r) => sum + r.points, 0);
  return {
    pointsPerSession: points / results.length,
    scoringRate: results.filter((r) => r.points > 0).length / results.length,
  };
}

function bestResult(results: SessionResult[]): DriverStats["best"] {
  if (!results.length) return null;
  const position = Math.min(...results.map((r) => r.position));
  return { position, count: results.filter((r) => r.position === position).length };
}

function ritmo(data: DriverSeasonData, sessions: DriverSession[]): number | null {
  const gaps: number[] = [];
  for (const { session, result } of sessions) {
    const lap = lapToMs(result.bestLap);
    if (lap === null) continue;
    const laps = (data.results[session.id] ?? []).map((r) => lapToMs(r.bestLap) ?? Infinity);
    const fastest = Math.min(...laps);
    if (fastest <= 0) continue;
    gaps.push((lap - fastest) / fastest);
  }
  return gaps.length ? gaps.reduce((sum, g) => sum + g, 0) / gaps.length : null;
}
