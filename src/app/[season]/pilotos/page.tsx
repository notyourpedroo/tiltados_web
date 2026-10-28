import type { Metadata } from "next";
import { Suspense } from "react";
import { ChampionshipCharts } from "@/components/ChampionshipCharts";
import { DriverStandingsTable } from "@/components/standings";
import { PageTitle, Skeleton } from "@/components/ui";
import { loadSeason } from "@/lib/load";
import { chartData } from "@/lib/chart";

export const metadata: Metadata = { title: "Pilotos" };

export default function DriversPage({ params }: PageProps<"/[season]/pilotos">) {
  return (
    <Suspense fallback={<Skeleton rows={10} />}>
      {params.then(({ season }) => (
        <Drivers season={season} />
      ))}
    </Suspense>
  );
}

async function Drivers({ season }: { season: string }) {
  const data = await loadSeason(season);
  const { sessions, series } = chartData(data);

  return (
    <>
      <PageTitle eyebrow={`Temporada ${data.season}`} title="Classificação de pilotos">
        Desempate por vitórias em GP e depois por pódios. “Sprints” conta vitórias em sprints.
      </PageTitle>

      <DriverStandingsTable data={data} />

      <ChampionshipCharts sessions={sessions} series={series} />
    </>
  );
}
