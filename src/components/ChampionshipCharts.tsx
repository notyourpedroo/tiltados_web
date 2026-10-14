"use client";

import {
  ProgressionChart,
  useHighlight,
  type ChartMode,
  type ChartSeries,
  type ChartSession,
} from "./ProgressionChart";
import { Card, SectionTitle } from "./ui";

const MODES: { mode: ChartMode; title: string }[] = [
  { mode: "points", title: "Pontos" },
  { mode: "position", title: "Posição" },
];

/**
 * Gráficos de evolução do campeonato. Destacar um piloto em um gráfico destaca
 * nos demais, para acompanhar a mesma pessoa nas duas visões.
 */
export function ChampionshipCharts({
  sessions,
  series,
}: {
  sessions: ChartSession[];
  series: ChartSeries[];
}) {
  const { selected, toggle } = useHighlight(series);

  return (
    <>
      {MODES.map(({ mode, title }) => (
        <section key={mode} className="mt-10">
          <SectionTitle>
            Evolução do campeonato <span className="text-muted">| {title}</span>
          </SectionTitle>
          <Card className="p-4 sm:p-6">
            <ProgressionChart
              mode={mode}
              sessions={sessions}
              series={series}
              selected={selected}
              onToggle={toggle}
            />
            <p className="mt-2 text-xs text-muted">
              Toque nos nomes para destacar até 3 pilotos (vale para os dois gráficos). A
              tabela de classificação traz os valores exatos.
            </p>
          </Card>
        </section>
      ))}
    </>
  );
}
