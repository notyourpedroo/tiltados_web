import type { ChartSeries, ChartSession } from "@/components/ProgressionChart";
import type { SeasonData, Session } from "./season";

/** "GP da China" → "China". */
export function shortGpName(gpName: string): string {
  return gpName.replace(/^GP (da|de|do|dos|das) /, "");
}

/** Sessões disputadas no formato do eixo X do gráfico de evolução. */
export function chartSessions(sessions: Session[]): ChartSession[] {
  return sessions.map((s) => ({
    label: shortGpName(s.gpName),
    round: s.round,
    isSprint: s.isSprint,
  }));
}

/** Dados do gráfico de evolução do campeonato, na ordem da classificação. */
export function chartData(data: SeasonData): {
  sessions: ChartSession[];
  series: ChartSeries[];
} {
  return {
    sessions: chartSessions(data.sessions),
    series: data.progression.map((p, i) => {
      const teamId = data.drivers[p.driverId]?.teamId;
      // Tracejado se um companheiro de equipe estiver à frente na classificação.
      const dashed = data.progression
        .slice(0, i)
        .some((q) => data.drivers[q.driverId]?.teamId === teamId);
      return {
        id: p.driverId,
        name: data.drivers[p.driverId]?.name ?? `#${p.driverId}`,
        color: data.teams[teamId]?.color ?? "var(--team-other)",
        dashed,
        cumulative: p.cumulative,
        positions: p.positions,
      };
    }),
  };
}
