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
    series: data.progression.map((p) => ({
      id: p.driverId,
      name: data.drivers[p.driverId]?.name ?? `#${p.driverId}`,
      cumulative: p.cumulative,
    })),
  };
}
