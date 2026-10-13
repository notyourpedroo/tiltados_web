import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { TeamStandingsTable } from "@/components/standings";
import { Card, PageTitle, SectionTitle, Skeleton, TeamLogo } from "@/components/ui";
import { ordinal } from "@/lib/format";
import { loadSeason } from "@/lib/load";
import { teamStyle } from "@/lib/teams";

export const metadata: Metadata = { title: "Equipes" };

export default function TeamsPage({ params }: PageProps<"/[season]/equipes">) {
  return (
    <Suspense fallback={<Skeleton rows={6} />}>
      {params.then(({ season }) => (
        <Teams season={season} />
      ))}
    </Suspense>
  );
}

async function Teams({ season }: { season: string }) {
  const data = await loadSeason(season);

  // Pontos que cada piloto somou por cada equipe (há trocas de equipe no meio da temporada).
  const contributions = new Map<number, Map<number, number>>();
  for (const list of Object.values(data.results)) {
    for (const r of list) {
      const byDriver = contributions.get(r.teamId) ?? new Map<number, number>();
      byDriver.set(r.driverId, (byDriver.get(r.driverId) ?? 0) + r.points);
      contributions.set(r.teamId, byDriver);
    }
  }

  return (
    <>
      <PageTitle eyebrow={`Temporada ${data.season}`} title="Campeonato de construtores">
        Soma dos pontos dos pilotos de cada equipe em corridas e sprints.
      </PageTitle>

      <TeamStandingsTable data={data} />

      <section className="mt-10">
        <SectionTitle>Equipes e pilotos</SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2">
          {data.teamStandings.map((t) => {
            const style = teamStyle(t.team_name);
            const drivers = [...(contributions.get(t.team_id) ?? [])].sort((a, b) => b[1] - a[1]);
            return (
              <Card key={t.team_id} className="stripe relative overflow-hidden p-5">
                <div
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-1"
                  style={{ backgroundColor: style.color }}
                />
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {style.logo && <TeamLogo logo={style.logo} size={44} />}
                    <div>
                      <p className="text-sm font-bold text-muted">{ordinal(t.position)}</p>
                      <p className="text-xl font-black uppercase leading-tight">{t.team_name}</p>
                    </div>
                  </div>
                  <p className="text-right">
                    <span className="block text-3xl font-black leading-none">{t.points}</span>
                    <span className="text-xs font-bold uppercase tracking-wider text-muted">pts</span>
                  </p>
                </div>

                {/* Contribuição de cada piloto: a fatia mais forte é a do maior pontuador. */}
                <div className="mt-4 flex h-2 gap-0.5 overflow-hidden rounded-full bg-bg" aria-hidden>
                  {drivers.map(([id, pts], i) =>
                    pts > 0 ? (
                      <div
                        key={id}
                        style={{
                          width: `${(pts / Math.max(t.points, 1)) * 100}%`,
                          backgroundColor: style.color,
                          opacity: i === 0 ? 1 : 0.45,
                        }}
                      />
                    ) : null,
                  )}
                </div>

                <ul className="mt-3 space-y-1.5">
                  {drivers.map(([id, pts], i) => (
                    <li key={id} className="flex items-center gap-2 text-sm">
                      <span
                        aria-hidden
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: style.color, opacity: i === 0 ? 1 : 0.45 }}
                      />
                      <Link
                        href={`/${data.season}/pilotos/${id}`}
                        className="font-bold hover:underline"
                      >
                        {data.drivers[id]?.name ?? `#${id}`}
                      </Link>
                      <span className="tabular ml-auto text-text-2">{pts} pts</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-xs text-muted">
                  {t.wins} vitórias · {t.podiums} pódios
                </p>
              </Card>
            );
          })}
        </div>
      </section>
    </>
  );
}
