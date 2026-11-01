import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { TitleChanceCard } from "@/components/chance";
import { HideOnError } from "@/components/HideOnError";
import { LicenseCard } from "@/components/LicenseCard";
import { SeasonStrip } from "@/components/SeasonStrip";
import { TeamDrivers } from "@/components/TeamDrivers";
import { TeammateDuel } from "@/components/TeammateDuel";
import {
  Card,
  DriverPositionBadge,
  PageTitle,
  SectionTitle,
  Skeleton,
  SprintBadge,
  StatTile,
  Table,
  TeamBar,
  TeamLogo,
  td,
  th,
  tr,
} from "@/components/ui";
import { getSuperLicense, getTeamPrediction } from "@/lib/api";
import { describeChance } from "@/lib/chance";
import { shortGpName } from "@/lib/chart";
import { formatDate, ordinal, plural } from "@/lib/format";
import { loadSeason } from "@/lib/load";
import { getSeason, type SeasonData } from "@/lib/season";
import { teamProfile, type TeamSession } from "@/lib/team-season";
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

/** Nome do piloto no cadastro, com o mesmo fallback do resto do site. */
function driverName(data: SeasonData, id: number) {
  return data.drivers[id]?.name ?? `#${id}`;
}

/** Chance de título de construtores da equipe em 2026, com o selo e o Motivo, para qualquer status. */
async function TeamTitleChance({ teamId }: { teamId: number }) {
  const row = (await getTeamPrediction()).find((p) => p.team_id === teamId);
  if (!row) return null;
  return (
    <TitleChanceCard
      title="Chance de título de construtores"
      view={describeChance(row, "team")}
      reason={row.probability_reason}
    />
  );
}

async function TeamProfile({ season, teamId }: { season: string; teamId: string }) {
  const data = await loadSeason(season);
  const standing = data.teamStandings.find((t) => String(t.team_id) === teamId);
  if (!standing) notFound();
  const style = teamStyle(standing.team_name);
  const { stats, sessions, drivers, duels } = teamProfile(data, standing.team_id);
  const driverLink = (id: number) => (
    <Link href={`/${data.season}/pilotos/${id}`} className="hover:underline">
      {driverName(data, id)}
    </Link>
  );
  // Superlicença de cada Piloto da equipe que aparece na rota, na ordem da lista.
  const licenses =
    data.season === "2026"
      ? await getSuperLicense().then((all) =>
          drivers.flatMap((d) => all.filter((l) => l.driver_id === d.id)),
        )
      : [];

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
          sub={`de ${plural(sessions.length, "sessão disputada", "sessões disputadas")}`}
        />
      </div>

      {/* Carrega à parte: se a rota demorar, o resto da página não espera; se
          falhar, o bloco some sem derrubar a página. */}
      {data.season === "2026" && (
        <HideOnError>
          <Suspense fallback={null}>
            <TeamTitleChance teamId={standing.team_id} />
          </Suspense>
        </HideOnError>
      )}

      {drivers.length > 0 && (
        <section className="mt-10">
          <SectionTitle>Pilotos da equipe</SectionTitle>
          <TeamDrivers
            season={data.season}
            drivers={drivers.map((d) => ({ ...d, name: driverName(data, d.id) }))}
          />
          {duels.length > 0 && (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {duels.map(({ drivers: [a, b] }) => (
                <TeammateDuel
                  key={`${a.id}-${b.id}`}
                  label="Duelo entre companheiros de equipe"
                  first={{ name: driverLink(a.id), ahead: a.ahead }}
                  second={{ name: driverLink(b.id), ahead: b.ahead }}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {licenses.length > 0 && (
        <section className="mt-10">
          <SectionTitle>Superlicença</SectionTitle>
          <div className="grid gap-4 sm:grid-cols-2">
            {licenses.map((l) => (
              <LicenseCard key={l.driver_id} license={l} />
            ))}
          </div>
        </section>
      )}

      <TeamSessions data={data} sessions={sessions} />
    </>
  );
}

/**
 * Temporada em resumo e Resultados: a equipe Sessão a Sessão, com os pilotos
 * que correram por ela em cada uma.
 */
function TeamSessions({ data, sessions }: { data: SeasonData; sessions: TeamSession[] }) {
  if (!sessions.length) {
    return (
      <section className="mt-10">
        <Card className="p-6 text-text-2">Nenhuma Sessão disputada ainda</Card>
      </section>
    );
  }
  return (
    <>
      <section className="mt-10">
        <SectionTitle>Temporada em resumo</SectionTitle>
        <SeasonStrip
          season={data.season}
          cells={sessions.map(({ session: s, drivers, points }) => ({
            session: s,
            value: points,
            position: drivers[0].position,
            points,
            title: `${s.name} — ${plural(points, "ponto", "pontos")}`,
          }))}
        />
      </section>

      <section className="mt-10">
        <SectionTitle>Resultados</SectionTitle>
        <Table>
          <thead>
            <tr>
              <th className={`${th} w-12`}>R</th>
              <th className={th}>Grande Prêmio</th>
              <th className={th}>Data</th>
              <th className={th}>Pilotos</th>
              <th className={`${th} text-right`}>Pts</th>
              <th className={`${th} text-right`}>Total</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map(({ session: s, drivers, points, total }) => (
              <tr key={s.id} className={tr}>
                <td className={`${td} tabular font-bold text-muted`}>{s.round}</td>
                <td className={td}>
                  <Link
                    href={`/${data.season}/corridas/${s.id}`}
                    className="flex items-center gap-2 font-bold hover:underline"
                  >
                    {shortGpName(s.gpName)}
                    {s.isSprint && <SprintBadge />}
                  </Link>
                </td>
                <td className={`${td} tabular whitespace-nowrap text-text-2`}>
                  {formatDate(s.date, false)}
                </td>
                <td className={td}>
                  <span className="flex flex-wrap gap-1">
                    {drivers.map((d) => (
                      <DriverPositionBadge key={d.driverId} name={driverName(data, d.driverId)} position={d.position} />
                    ))}
                  </span>
                </td>
                <td className={`${td} tabular text-right font-bold`}>
                  {points || <span className="font-normal text-muted">0</span>}
                </td>
                <td className={`${td} tabular text-right text-text-2`}>{total}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </section>
    </>
  );
}
