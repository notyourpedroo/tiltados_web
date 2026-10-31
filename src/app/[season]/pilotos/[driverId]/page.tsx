import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ChanceBadge, ChanceBar } from "@/components/chance";
import { HideOnError } from "@/components/HideOnError";
import {
  Card,
  FastestLapBadge,
  Gained,
  PageTitle,
  Position,
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
import { getDriverPrediction, getSuperLicense } from "@/lib/api";
import { describeChance } from "@/lib/chance";
import { shortGpName } from "@/lib/chart";
import { formatDate, ordinal, plural } from "@/lib/format";
import { loadSeason } from "@/lib/load";
import { getSeason, type Session, type SessionResult } from "@/lib/season";
import { teamStyle } from "@/lib/teams";
import { isSeason } from "@/lib/types";

export async function generateStaticParams({
  params,
}: {
  params: { season: string };
}) {
  if (!isSeason(params.season)) return [];
  const data = await getSeason(params.season);
  return data.driverStandings.map((d) => ({ driverId: String(d.driver_id) }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[season]/pilotos/[driverId]">): Promise<Metadata> {
  const { season, driverId } = await params;
  if (!isSeason(season)) return {};
  const data = await getSeason(season);
  const driver = data.drivers[Number(driverId)];
  return driver ? { title: `${driver.name} · ${season}` } : {};
}

export default function DriverPage({ params }: PageProps<"/[season]/pilotos/[driverId]">) {
  return (
    <Suspense fallback={<Skeleton rows={10} />}>
      {params.then(({ season, driverId }) => (
        <DriverProfile season={season} driverId={driverId} />
      ))}
    </Suspense>
  );
}

/** Chance de título do piloto em 2026, com o selo e o Motivo, para qualquer status. */
async function DriverTitleChance({ driverId }: { driverId: number }) {
  const row = (await getDriverPrediction()).find((p) => p.driver_id === driverId);
  if (!row) return null;
  const view = describeChance(row, "driver");

  return (
    <Card className="mt-4 p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-bold uppercase tracking-wider text-muted">Chance de título</p>
        <ChanceBadge view={view} />
      </div>
      <p className="tabular mt-1 text-2xl font-black">{view.text}</p>
      <div className="mt-2">
        <ChanceBar view={view} label={`Chance de título: ${view.text}`} />
      </div>
      <p className="mt-3 text-sm text-text-2">{row.probability_reason}</p>
    </Card>
  );
}

const CELL_STYLE: Record<number, string> = {
  1: "bg-gold-fill text-on-fill",
  2: "bg-silver-fill text-on-fill",
  3: "bg-bronze-fill text-on-fill",
};

async function DriverProfile({ season, driverId }: { season: string; driverId: string }) {
  const data = await loadSeason(season);
  const id = Number(driverId);
  const standing = data.driverStandings.find((d) => d.driver_id === id);
  if (!standing) notFound();
  const team = teamStyle(standing.team_name);
  const license =
    data.season === "2026"
      ? (await getSuperLicense()).find((l) => l.driver_id === id)
      : undefined;
  const penalties = data.punishments.filter((p) => p.driver_id === id);

  const races: { s: Session; r: SessionResult; total: number }[] = [];
  let running = 0;
  for (const s of data.sessions) {
    const r = data.results[s.id].find((res) => res.driverId === id);
    if (!r) continue;
    running += r.points;
    races.push({ s, r, total: running });
  }

  const poles = races.filter(({ r }) => r.grid === 1).length;
  const fastestLaps = races.filter(({ r }) => r.fastestLap).length;
  const mainRaces = races.filter(({ s }) => !s.isSprint);
  const avgFinish = mainRaces.length
    ? mainRaces.reduce((sum, { r }) => sum + r.position, 0) / mainRaces.length
    : 0;
  const best = Math.min(...races.map(({ r }) => r.position));
  const bestCount = races.filter(({ r }) => r.position === best).length;
  const gainedTotal = races.reduce((sum, { r }) => sum + r.gained, 0);

  // Duelo com companheiros: sessões em que ambos correram pela mesma equipe.
  const duels = new Map<number, { ahead: number; behind: number }>();
  for (const { s, r } of races) {
    for (const other of data.results[s.id]) {
      if (other.driverId === id || other.teamId !== r.teamId) continue;
      const d = duels.get(other.driverId) ?? { ahead: 0, behind: 0 };
      if (r.position < other.position) d.ahead++;
      else d.behind++;
      duels.set(other.driverId, d);
    }
  }

  return (
    <>
      <PageTitle
        eyebrow={`${ordinal(standing.position)} no campeonato ${data.season}`}
        title={
          <span className="flex items-center gap-4">
            <TeamBar color={team.color} className="h-10 w-1.5 sm:h-14" />
            {standing.driver_name}
          </span>
        }
      >
        <Link
          href={`/${data.season}/equipes/${standing.team_id}`}
          className="inline-flex items-center gap-2 hover:underline"
        >
          {team.logo && <TeamLogo logo={team.logo} size={32} />}
          {standing.team_name}
        </Link>
      </PageTitle>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatTile label="Pontos" value={standing.points} sub={`${ordinal(standing.position)} lugar`} />
        <StatTile
          label="Vitórias"
          value={standing.wins}
          sub={plural(standing.sprint_wins, "vitória em sprint", "vitórias em sprint")}
        />
        <StatTile label="Pódios" value={standing.podiums} sub={plural(standing.races, "sessão disputada", "sessões disputadas")} />
        <StatTile
          label="Melhor resultado"
          value={ordinal(best)}
          sub={`${bestCount}×`}
        />
        <StatTile label="Poles" value={poles} />
        <StatTile label="Voltas mais rápidas" value={fastestLaps} />
        <StatTile
          label="Chegada média"
          value={avgFinish ? avgFinish.toFixed(1).replace(".", ",") : "—"}
          sub="em corridas"
        />
        <StatTile
          label="Posições ganhas"
          value={gainedTotal > 0 ? `+${gainedTotal}` : gainedTotal}
          sub="saldo grid → chegada"
        />
      </div>

      {/* Carrega à parte: se a rota demorar, o resto da página não espera; se
          falhar, o bloco some sem derrubar a página. */}
      {data.season === "2026" && (
        <HideOnError>
          <Suspense fallback={null}>
            <DriverTitleChance driverId={id} />
          </Suspense>
        </HideOnError>
      )}

      <section className="mt-10">
        <SectionTitle>Temporada em resumo</SectionTitle>
        <Card className="p-4">
          <ol className="flex flex-wrap gap-1.5">
            {races.map(({ s, r }) => (
              <li key={s.id}>
                <Link
                  href={`/${data.season}/corridas/${s.id}`}
                  title={`${s.name} — ${ordinal(r.position)}`}
                  className={`tabular flex h-10 w-10 flex-col items-center justify-center rounded-md text-sm font-black transition-transform hover:scale-110 ${
                    CELL_STYLE[r.position] ?? (r.points ? "bg-surface-2 text-text" : "bg-bg text-muted")
                  }`}
                >
                  {r.position}
                  <span className="text-[8px] font-bold leading-none opacity-70">
                    {s.isSprint ? "SPR" : `R${s.round}`}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </Card>
      </section>

      {(duels.size > 0 || license) && (
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {[...duels].map(([otherId, d]) => {
            const totalDuels = d.ahead + d.behind;
            return (
              <Card key={otherId} className="p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-muted">
                  Duelo com companheiro de equipe
                </p>
                <div className="mt-2 flex items-baseline justify-between gap-2 text-lg font-black">
                  <span>{standing.driver_name} <span className="tabular">{d.ahead}</span></span>
                  <span className="text-muted">×</span>
                  <span>
                    <span className="tabular">{d.behind}</span>{" "}
                    <Link href={`/${data.season}/pilotos/${otherId}`} className="hover:underline">
                      {data.drivers[otherId]?.name}
                    </Link>
                  </span>
                </div>
                <div className="mt-3 flex h-2 gap-0.5 overflow-hidden rounded-full" aria-hidden>
                  <div className="bg-text" style={{ width: `${(d.ahead / totalDuels) * 100}%` }} />
                  <div className="flex-1 bg-surface-2" />
                </div>
                <p className="mt-2 text-xs text-muted">
                  Quem chegou na frente, em {plural(totalDuels, "sessão", "sessões")} juntos
                </p>
              </Card>
            );
          })}
          {license && (
            <Card className="p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-muted">Superlicença</p>
              <p className="mt-1 text-lg font-black">
                {license.remaining_points}
                <span className="text-muted"> / {license.initial_points} pts</span>
              </p>
              {penalties.length ? (
                <ul className="mt-2 space-y-1 text-sm text-text-2">
                  {penalties.map((p) => (
                    <li key={`${p.race_id}-${p.penalty_reason}`}>
                      <span className="font-bold text-loss">−{p.deduction_points}</span> ·{" "}
                      {p.race_name}: {p.penalty_reason}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-text-2">Nenhuma punição na temporada.</p>
              )}
            </Card>
          )}
        </div>
      )}

      <section className="mt-10">
        <SectionTitle>Resultados</SectionTitle>
        <Table>
          <thead>
            <tr>
              <th className={`${th} w-12`}>R</th>
              <th className={th}>Grande Prêmio</th>
              <th className={th}>Data</th>
              <th className={`${th} text-right`}>Grid</th>
              <th className={`${th} text-right`}>Pos</th>
              <th className={`${th} text-right`}>+/−</th>
              <th className={th}>Melhor volta</th>
              <th className={`${th} text-right`}>Pts</th>
              <th className={`${th} text-right`}>Total</th>
            </tr>
          </thead>
          <tbody>
            {races.map(({ s, r, total }) => {
              const raceTeam = data.teams[r.teamId];
              const changedTeam = raceTeam && raceTeam.name !== standing.team_name;
              return (
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
                    {changedTeam && (
                      <span className="text-xs text-muted">pela {raceTeam.short}</span>
                    )}
                  </td>
                  <td className={`${td} tabular whitespace-nowrap text-text-2`}>
                    {formatDate(s.date, false)}
                  </td>
                  <td className={`${td} tabular text-right text-text-2`}>{r.grid}</td>
                  <td className={`${td} text-right text-base`}>
                    <Position value={r.position} />
                  </td>
                  <td className={`${td} text-right`}>
                    <Gained value={r.gained} />
                  </td>
                  <td className={`${td} tabular whitespace-nowrap`}>
                    <span className={r.fastestLap ? "font-bold text-purple" : "text-text-2"}>
                      {r.bestLap}
                    </span>
                    {r.fastestLap && <FastestLapBadge />}
                  </td>
                  <td className={`${td} tabular text-right font-bold`}>
                    {r.points || <span className="font-normal text-muted">0</span>}
                  </td>
                  <td className={`${td} tabular text-right text-text-2`}>{total}</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </section>
    </>
  );
}
