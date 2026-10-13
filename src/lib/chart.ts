import type { ChartSeries, ChartSession } from "@/components/PointsChart";
import type { SeasonData } from "./season";

/** "GP da China" → "China". */
export function shortGpName(gpName: string): string {
  return gpName.replace(/^GP (da|de|do|dos|das) /, "");
}

/** Dados do gráfico de evolução do campeonato, na ordem da classificação. */
export function chartData(data: SeasonData): {
  sessions: ChartSession[];
  series: ChartSeries[];
} {
  return {
    sessions: data.sessions.map((s) => ({
      label: shortGpName(s.gpName),
      round: s.round,
      isSprint: s.isSprint,
    })),
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
      };
    }),
  };
}
