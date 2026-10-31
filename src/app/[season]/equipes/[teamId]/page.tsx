import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageTitle, Skeleton, StatTile, TeamBar, TeamLogo } from "@/components/ui";
import { ordinal } from "@/lib/format";
import { loadSeason } from "@/lib/load";
import { getSeason } from "@/lib/season";
import { teamProfile } from "@/lib/team-season";
import { teamStyle } from "@/lib/teams";
import { isSeason } from "@/lib/types";

export async function generateStaticParams({
  params,
}: {
  params: { season: string };
}) {
  if (!isSeason(params.season)) return [];
  const data = await getSeason(params.season);
  return data.teamStandings.map((t) => ({ teamId: String(t.team_id) }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[season]/equipes/[teamId]">): Promise<Metadata> {
  const { season, teamId } = await params;
  if (!isSeason(season)) return {};
  const data = await getSeason(season);
  const standing = data.teamStandings.find((t) => String(t.team_id) === teamId);
  return standing ? { title: `${standing.team_name} · ${season}` } : {};
}

export default function TeamPage({ params }: PageProps<"/[season]/equipes/[teamId]">) {
  return (
    <Suspense fallback={<Skeleton rows={10} />}>
      {params.then(({ season, teamId }) => (
        <TeamProfile season={season} teamId={teamId} />
      ))}
    </Suspense>
  );
}

async function TeamProfile({ season, teamId }: { season: string; teamId: string }) {
  const data = await loadSeason(season);
  const standing = data.teamStandings.find((t) => String(t.team_id) === teamId);
  if (!standing) notFound();
  const style = teamStyle(standing.team_name);
  const { stats } = teamProfile(data, standing.team_id);

  return (
    <>
      <PageTitle
        eyebrow={`${ordinal(standing.position)} no campeonato de construtores ${data.season}`}
        title={
          <span className="flex items-center gap-4">
            <TeamBar color={style.color} className="h-10 w-1.5 sm:h-14" />
            {style.logo && <TeamLogo logo={style.logo} size={44} />}
            {standing.team_name}
          </span>
        }
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatTile label="Pontos" value={stats.points} sub={`${ordinal(standing.position)} lugar`} />
        <StatTile label="Vitórias" value={stats.wins} sub="em corridas" />
        <StatTile label="Pódios" value={stats.podiums} sub="corridas e sprints" />
        <StatTile label="Dobradinhas" value={stats.oneTwos} sub="1º e 2º em corridas" />
        <StatTile label="Poles" value={stats.poles} />
        <StatTile label="Voltas mais rápidas" value={stats.fastestLaps} />
        <StatTile
          label="Melhor resultado"
          value={stats.best ? ordinal(stats.best.position) : "—"}
          sub={stats.best && `${stats.best.count}×`}
        />
        <StatTile
          label="Dois nos pontos"
          value={stats.bothScored}
          sub={stats.bothScored === 1 ? "sessão" : "sessões"}
        />
      </div>
    </>
  );
}
