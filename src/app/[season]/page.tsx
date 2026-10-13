import Link from "next/link";
import { Suspense } from "react";
import { PointsChart } from "@/components/PointsChart";
import { DriverStandingsTable, TeamStandingsTable } from "@/components/standings";
import {
  Card,
  MoreLink,
  PageTitle,
  SectionTitle,
  Skeleton,
  SprintBadge,
  StatTile,
  TeamBar,
} from "@/components/ui";
import { chartData } from "@/lib/chart";
import { formatDate, plural } from "@/lib/format";
import { loadSeason } from "@/lib/load";
import { mainSessions, type SeasonData, type SessionResult } from "@/lib/season";
import { teamStyle } from "@/lib/teams";

export default function SeasonPage({ params }: PageProps<"/[season]">) {
  return (
    <Suspense fallback={<Skeleton rows={8} />}>
      {params.then(({ season }) => (
        <Overview season={season} />
      ))}
    </Suspense>
  );
}

/** Piloto(s) com mais resultados que satisfazem `pick` (empates listados juntos). */
function topBy(data: SeasonData, pick: (r: SessionResult) => boolean) {
  const count = new Map<number, number>();
  for (const list of Object.values(data.results)) {
    for (const r of list) {
      if (pick(r)) count.set(r.driverId, (count.get(r.driverId) ?? 0) + 1);
    }
  }
  const best = Math.max(0, ...count.values());
  const names = [...count]
    .filter(([, c]) => c === best)
    .map(([id]) => data.drivers[id]?.name ?? `#${id}`);
  return { best, names };
}

async function Overview({ season }: { season: string }) {
  const data = await loadSeason(season);
  const finished = Number(data.season) < 2026;
  const [leader, second] = data.driverStandings;
  const leaderTeam = leader ? teamStyle(leader.team_name) : null;
  const mains = mainSessions(data);
  const last = mains.at(-1);
  const lastPodium = last ? data.results[last.id].slice(0, 3) : [];
  const rounds = mains.length;

  const winners = new Set(
    data.sessions.filter((s) => !s.isSprint).map((s) => data.results[s.id][0]?.driverId),
  );
  const poles = topBy(data, (r) => r.grid === 1);
  const fastest = topBy(data, (r) => r.fastestLap);

  const chart = chartData(data);

  return (
    <>
      <PageTitle eyebrow="Tiltados F1" title={`Temporada ${data.season}`}>
        {plural(rounds, "etapa", "etapas")} · {plural(data.sessions.length, "sessão", "sessões")}
        {last && (
          <>
            {" "}· {finished ? "encerrada em" : "última etapa:"} {last.gpName} ({formatDate(last.date, false)})
          </>
        )}
      </PageTitle>

      <div className="grid gap-4 lg:grid-cols-5">
        {leader && leaderTeam && (
          <Card className="stripe relative overflow-hidden p-6 lg:col-span-3">
            <div
              aria-hidden
              className="absolute inset-y-0 left-0 w-1.5"
              style={{ backgroundColor: leaderTeam.color }}
            />
            <p className="text-sm font-bold uppercase tracking-widest text-gold">
              {finished ? "🏆 Campeão" : "Líder do campeonato"}
            </p>
            <Link
              href={`/${data.season}/pilotos/${leader.driver_id}`}
              className="mt-1 block text-5xl font-black uppercase leading-none tracking-tight hover:underline sm:text-6xl"
            >
              {leader.driver_name}
            </Link>
            <p className="mt-2 text-text-2">{leader.team_name}</p>
            <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
              <div>
                <p className="text-4xl font-black">{leader.points}</p>
                <p className="text-xs font-bold uppercase tracking-wider text-muted">pontos</p>
              </div>
              <div>
                <p className="text-4xl font-black">{leader.wins}</p>
                <p className="text-xs font-bold uppercase tracking-wider text-muted">vitórias</p>
              </div>
              <div>
                <p className="text-4xl font-black">{leader.podiums}</p>
                <p className="text-xs font-bold uppercase tracking-wider text-muted">pódios</p>
              </div>
              {second && (
                <div>
                  <p className="text-4xl font-black">+{leader.points - second.points}</p>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted">
                    sobre {second.driver_name}
                  </p>
                </div>
              )}
            </div>
          </Card>
        )}

        {last && (
          <Card className="flex flex-col p-6 lg:col-span-2">
            <p className="text-sm font-bold uppercase tracking-widest text-muted">
              Última corrida · R{last.round}
            </p>
            <p className="mt-1 text-2xl font-black uppercase leading-tight">{last.gpName}</p>
            <p className="text-sm text-text-2">
              {last.location} · {formatDate(last.date)} {last.isSprint && <SprintBadge />}
            </p>
            <ol className="mt-4 flex-1 space-y-2">
              {lastPodium.map((r) => {
                const team = data.teams[r.teamId];
                return (
                  <li key={r.driverId} className="flex items-center gap-3">
                    <span
                      className={`w-5 text-lg font-black ${
                        ["text-gold", "text-silver", "text-bronze"][r.position - 1]
                      }`}
                    >
                      {r.position}
                    </span>
                    <TeamBar color={team?.color ?? "var(--team-other)"} />
                    <span className="font-bold">{data.drivers[r.driverId]?.name}</span>
                    <span className="text-sm text-muted">{team?.short}</span>
                    <span className="tabular ml-auto text-sm text-text-2">+{r.points} pts</span>
                  </li>
                );
              })}
            </ol>
            <div className="mt-4">
              <MoreLink href={`/${data.season}/corridas/${last.id}`}>Resultado completo</MoreLink>
            </div>
          </Card>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Etapas" value={rounds} sub={plural(data.sessions.filter((s) => s.isSprint).length, "sprint", "sprints")} />
        <StatTile label="Vencedores diferentes" value={winners.size} sub="em corridas principais" />
        <StatTile label="Mais poles" value={poles.best} sub={poles.names.join(", ")} />
        <StatTile label="Mais voltas rápidas" value={fastest.best} sub={fastest.names.join(", ")} />
      </div>

      <section className="mt-10">
        <SectionTitle>Evolução do campeonato</SectionTitle>
        <Card className="p-4 sm:p-6">
          <PointsChart sessions={chart.sessions} series={chart.series} />
        </Card>
      </section>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section>
          <SectionTitle action={<MoreLink href={`/${data.season}/pilotos`}>Ver tudo</MoreLink>}>
            Pilotos
          </SectionTitle>
          <DriverStandingsTable data={data} compact />
        </section>
        <section>
          <SectionTitle action={<MoreLink href={`/${data.season}/equipes`}>Ver tudo</MoreLink>}>
            Construtores
          </SectionTitle>
          <TeamStandingsTable data={data} compact />
        </section>
      </div>
    </>
  );
}
