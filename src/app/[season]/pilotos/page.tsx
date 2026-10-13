import type { Metadata } from "next";
import { Suspense } from "react";
import { PointsChart } from "@/components/PointsChart";
import { DriverStandingsTable } from "@/components/standings";
import { Card, PageTitle, SectionTitle, Skeleton } from "@/components/ui";
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
        Desempate por vitórias em GP e depois por pódios. “Sprints” conta vitórias em
        corridas sprint.
      </PageTitle>

      <DriverStandingsTable data={data} />

      <section className="mt-10">
        <SectionTitle>Evolução do campeonato</SectionTitle>
        <Card className="p-4 sm:p-6">
          <PointsChart sessions={sessions} series={series} />
        </Card>
      </section>
    </>
  );
}
