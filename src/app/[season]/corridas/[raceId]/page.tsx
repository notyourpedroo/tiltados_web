import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  Card,
  FastestLapBadge,
  Gained,
  PageTitle,
  Position,
  SectionTitle,
  Skeleton,
  SprintBadge,
  Table,
  TeamBar,
  td,
  th,
  tr,
} from "@/components/ui";
import { shortGpName } from "@/lib/chart";
import { formatDate } from "@/lib/format";
import { loadSeason } from "@/lib/load";
import { getSeason, weekendOf } from "@/lib/season";
import { isSeason } from "@/lib/types";

export async function generateStaticParams({
  params,
}: {
  params: { season: string };
}) {
  if (!isSeason(params.season)) return [];
  const data = await getSeason(params.season);
  return data.sessions.map((s) => ({ raceId: String(s.id) }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[season]/corridas/[raceId]">): Promise<Metadata> {
  const { season, raceId } = await params;
  if (!isSeason(season)) return {};
  const data = await getSeason(season);
  const session = data.sessions.find((s) => String(s.id) === raceId);
  return session ? { title: `${session.name} ${season}` } : {};
}

export default function RacePage({ params }: PageProps<"/[season]/corridas/[raceId]">) {
  return (
    <Suspense fallback={<Skeleton rows={10} />}>
      {params.then(({ season, raceId }) => (
        <Race season={season} raceId={raceId} />
      ))}
    </Suspense>
  );
}

const PODIUM_STYLE = [
  { label: "1º", text: "text-gold", order: "sm:order-2", lift: "sm:-mt-4" },
  { label: "2º", text: "text-silver", order: "sm:order-1", lift: "" },
  { label: "3º", text: "text-bronze", order: "sm:order-3", lift: "" },
];

async function Race({ season, raceId }: { season: string; raceId: string }) {
  const data = await loadSeason(season);
  const index = data.sessions.findIndex((s) => String(s.id) === raceId);
  if (index === -1) notFound();
  const session = data.sessions[index];
  const results = data.results[session.id];
  const weekend = weekendOf(data, session);
  const prev = data.sessions[index - 1];
  const next = data.sessions[index + 1];
  const penalties = data.punishments.filter((p) => p.race_id === session.id);
  const climber = [...results].sort((a, b) => b.gained - a.gained)[0];
  const name = (id: number) => data.drivers[id]?.name ?? `#${id}`;

  return (
    <>
      <PageTitle
        eyebrow={`Etapa ${session.round} · ${data.season}`}
        title={
          <span className="flex flex-wrap items-center gap-3">
            {session.gpName}
            {session.isSprint && <SprintBadge />}
          </span>
        }
      >
        {session.location} · {formatDate(session.date)}
      </PageTitle>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        {weekend.length > 1 ? (
          <div className="flex rounded-full border border-line p-0.5 text-sm font-bold" role="group" aria-label="Sessão">
            {weekend.map((s) => (
              <Link
                key={s.id}
                href={`/${data.season}/corridas/${s.id}`}
                aria-current={s.id === session.id ? "page" : undefined}
                className={`rounded-full px-4 py-1 transition-colors ${
                  s.id === session.id ? "bg-text text-bg" : "text-text-2 hover:text-text"
                }`}
              >
                {s.isSprint ? "Sprint" : "Corrida"}
              </Link>
            ))}
          </div>
        ) : (
          <span />
        )}
        <div className="flex gap-2 text-sm font-bold">
          {prev && (
            <Link
              href={`/${data.season}/corridas/${prev.id}`}
              className="rounded-full border border-line px-3 py-1 text-text-2 hover:text-text"
            >
              ← {shortGpName(prev.gpName)}
              {prev.isSprint && " (Sprint)"}
            </Link>
          )}
          {next && (
            <Link
              href={`/${data.season}/corridas/${next.id}`}
              className="rounded-full border border-line px-3 py-1 text-text-2 hover:text-text"
            >
              {shortGpName(next.gpName)}
              {next.isSprint && " (Sprint)"} →
            </Link>
          )}
        </div>
      </div>

      <div className="mb-8 grid gap-3 sm:grid-cols-3 sm:items-end">
        {results.slice(0, 3).map((r, i) => {
          const team = data.teams[r.teamId];
          const style = PODIUM_STYLE[i];
          return (
            <Card key={r.driverId} className={`stripe relative overflow-hidden p-5 ${style.order} ${style.lift}`}>
              <div
                aria-hidden
                className="absolute inset-x-0 top-0 h-1"
                style={{ backgroundColor: team?.color }}
              />
              <p className={`text-3xl font-black ${style.text}`}>{style.label}</p>
              <Link
                href={`/${data.season}/pilotos/${r.driverId}`}
                className="mt-1 block text-2xl font-black uppercase leading-tight hover:underline"
              >
                {name(r.driverId)}
              </Link>
              <p className="text-sm text-text-2">{team?.name}</p>
              <p className="tabular mt-3 text-sm text-muted">
                Largou em {r.grid}º · +{r.points} pts
              </p>
            </Card>
          );
        })}
      </div>

      <SectionTitle>Classificação</SectionTitle>
      <Table>
        <thead>
          <tr>
            <th className={`${th} w-12`}>Pos</th>
            <th className={th}>Piloto</th>
            <th className={`${th} hidden sm:table-cell`}>Equipe</th>
            <th className={`${th} text-right`}>Grid</th>
            <th className={`${th} text-right`}>+/−</th>
            <th className={th}>Melhor volta</th>
            <th className={`${th} text-right`}>Pts</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r) => {
            const team = data.teams[r.teamId];
            return (
              <tr key={r.driverId} className={tr}>
                <td className={`${td} text-base`}>
                  <Position value={r.position} />
                </td>
                <td className={td}>
                  <Link
                    href={`/${data.season}/pilotos/${r.driverId}`}
                    className="flex items-center gap-3 hover:underline"
                  >
                    <TeamBar color={team?.color ?? "#888"} />
                    <span>
                      <span className="block text-base font-bold leading-tight">{name(r.driverId)}</span>
                      <span className="block text-xs text-muted sm:hidden">{team?.short}</span>
                    </span>
                  </Link>
                </td>
                <td className={`${td} hidden text-text-2 sm:table-cell`}>{team?.name}</td>
                <td className={`${td} tabular text-right text-text-2`}>{r.grid}</td>
                <td className={`${td} text-right`}>
                  <Gained value={r.gained} />
                </td>
                <td className={`${td} tabular whitespace-nowrap`}>
                  <span className={r.fastestLap ? "font-bold text-purple" : "text-text-2"}>
                    {r.bestLap}
                  </span>
                  {r.fastestLap && <FastestLapBadge />}
                </td>
                <td className={`${td} tabular text-right text-base font-black`}>
                  {r.points || <span className="font-normal text-muted">0</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {climber && climber.gained > 0 && (
          <Card className="p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-muted">
              Maior recuperação
            </p>
            <p className="mt-1 text-xl font-black">
              {name(climber.driverId)}{" "}
              <span className="text-gain">▲ {climber.gained}</span>
            </p>
            <p className="text-sm text-text-2">
              Do {climber.grid}º ao {climber.position}º lugar
            </p>
          </Card>
        )}
        {penalties.map((p) => (
          <Card key={`${p.driver_id}-${p.penalty_reason}`} className="border-loss/40 p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-loss">
              ⚠ Punição na Superlicença · −{p.deduction_points} pts
            </p>
            <p className="mt-1 text-xl font-black">{p.driver_name}</p>
            <p className="text-sm text-text-2">{p.penalty_reason}</p>
          </Card>
        ))}
      </div>
    </>
  );
}
