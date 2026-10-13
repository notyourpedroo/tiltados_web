import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PageTitle, Skeleton, Table, TeamBar, td, th, tr } from "@/components/ui";
import { formatDate } from "@/lib/format";
import { loadSeason } from "@/lib/load";
import { weekendOf, mainSessions, type SeasonData, type SessionResult } from "@/lib/season";

export const metadata: Metadata = { title: "Corridas" };

export default function RacesPage({ params }: PageProps<"/[season]/corridas">) {
  return (
    <Suspense fallback={<Skeleton rows={12} />}>
      {params.then(({ season }) => (
        <Races season={season} />
      ))}
    </Suspense>
  );
}

function DriverChip({ data, result }: { data: SeasonData; result?: SessionResult }) {
  if (!result) return <span className="text-muted">—</span>;
  const team = data.teams[result.teamId];
  return (
    <span className="flex items-center gap-2 whitespace-nowrap">
      <TeamBar color={team?.color ?? "var(--team-other)"} className="h-4" />
      <span className="font-bold">{data.drivers[result.driverId]?.name}</span>
    </span>
  );
}

async function Races({ season }: { season: string }) {
  const data = await loadSeason(season);
  const rounds = mainSessions(data);

  return (
    <>
      <PageTitle eyebrow={`Temporada ${data.season}`} title="Resultados das corridas">
        Vencedor, pole e volta mais rápida de cada etapa. Toque em uma corrida para ver a
        classificação completa.
      </PageTitle>

      <Table>
        <thead>
          <tr>
            <th className={`${th} w-12`}>R</th>
            <th className={th}>Grande Prêmio</th>
            <th className={th}>Data</th>
            <th className={th}>Vencedor</th>
            <th className={th}>Pole</th>
            <th className={th}>Volta mais rápida</th>
            <th className={th}>Sprint</th>
          </tr>
        </thead>
        <tbody>
          {rounds.map((main) => {
            const sprint = weekendOf(data, main).find((s) => s.isSprint && s.id !== main.id);
            const res = data.results[main.id];
            const winner = res[0];
            const pole = res.find((r) => r.grid === 1);
            const fastest = res.find((r) => r.fastestLap);
            return (
              <tr key={main.id} className={tr}>
                <td className={`${td} tabular font-bold text-muted`}>{main.round}</td>
                <td className={td}>
                  <Link
                    href={`/${data.season}/corridas/${main.id}`}
                    className="block font-bold hover:underline"
                  >
                    {main.gpName}
                  </Link>
                  <span className="text-xs text-muted">{main.location}</span>
                </td>
                <td className={`${td} tabular whitespace-nowrap text-text-2`}>
                  {formatDate(main.date)}
                </td>
                <td className={td}>
                  <DriverChip data={data} result={winner} />
                </td>
                <td className={td}>
                  <DriverChip data={data} result={pole} />
                </td>
                <td className={td}>
                  {fastest ? (
                    <span className="flex items-center gap-2 whitespace-nowrap">
                      <DriverChip data={data} result={fastest} />
                      <span className="tabular text-xs text-purple">{fastest.bestLap}</span>
                    </span>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </td>
                <td className={td}>
                  {sprint ? (
                    <Link
                      href={`/${data.season}/corridas/${sprint.id}`}
                      className="flex items-center gap-2 whitespace-nowrap hover:underline"
                    >
                      <DriverChip data={data} result={data.results[sprint.id][0]} />
                    </Link>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </>
  );
}
