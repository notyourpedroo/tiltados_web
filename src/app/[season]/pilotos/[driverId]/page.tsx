import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { TitleChanceCard } from "@/components/chance";
import { HideOnError } from "@/components/HideOnError";
import { SeasonComparison } from "@/components/SeasonComparison";
import { SeasonStrip } from "@/components/SeasonStrip";
import { TeammateDuel } from "@/components/TeammateDuel";
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
import { driverProfile, seasonComparison } from "@/lib/driver-season";
import { shortGpName } from "@/lib/chart";
import { decimal, formatDate, lastWeekends, ordinal, percent, plural } from "@/lib/format";
import { loadSeason } from "@/lib/load";
import { getSeason } from "@/lib/season";
import { teamCar, teamStyle } from "@/lib/teams";
import { isSeason, SEASONS, type Season } from "@/lib/types";
import { recentFormWeekends } from "@/lib/weekend";

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
  return (
    <TitleChanceCard
      title="Chance de título"
      view={describeChance(row, "driver")}
      reason={row.probability_reason}
    />
  );
}

/**
 * Card comparativo com a Temporada passada (a anterior na lista de temporadas), pelo
 * mesmo ID. Some na primeira temporada e para quem não tem Sessão disputada nas duas.
 */
async function DriverSeasonComparison({ season, driverId }: { season: Season; driverId: number }) {
  const previousSeason = SEASONS[SEASONS.indexOf(season) - 1];
  if (!previousSeason) return null;
  const [current, previous] = await Promise.all([getSeason(season), getSeason(previousSeason)]);
  const comparison = seasonComparison(driverProfile(current, driverId), driverProfile(previous, driverId));
  if (!comparison) return null;
  return (
    <div className="mt-10 grid gap-4 sm:grid-cols-2">
      <SeasonComparison season={season} previousSeason={previousSeason} {...comparison} />
    </div>
  );
}

async function DriverProfile({ season, driverId }: { season: string; driverId: string }) {
  const data = await loadSeason(season);
  const id = Number(driverId);
  const standing = data.driverStandings.find((d) => d.driver_id === id);
  if (!standing) notFound();
  const team = teamStyle(standing.team_name);
  // Carro da equipe do cadastro, a mesma do logo e do nome no cabeçalho.
  const car = teamCar(standing.team_name, data.season);
  const license =
    data.season === "2026"
      ? (await getSuperLicense()).find((l) => l.driver_id === id)
      : undefined;
  const penalties = data.punishments.filter((p) => p.driver_id === id);

  const { stats, sequencias, performance, sessions, duels } = driverProfile(data, id);
  const formWeekends = recentFormWeekends(data.sessions);

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
        car={car}
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
          value={stats.best ? ordinal(stats.best.position) : "—"}
          sub={stats.best && `${stats.best.count}×`}
        />
        <StatTile label="Poles" value={stats.poles} sub={stats.poles > 0 && poleConversion(stats.poleConversion)} />
        <StatTile label="Voltas mais rápidas" value={stats.fastestLaps} />
        <StatTile label="Hat-tricks" value={stats.hatTricks} sub="pole, vitória e volta mais rápida" />
        <StatTile
          label="Chegada média"
          value={stats.avgFinish === null ? "—" : stats.avgFinish.toFixed(1).replace(".", ",")}
          sub="em corridas"
        />
        <StatTile
          label="Posições ganhas"
          value={stats.gained > 0 ? `+${stats.gained}` : stats.gained}
          sub="saldo grid → chegada"
        />
        <StatTile
          label="Forma recente"
          value={formWeekends ? stats.recentForm : "—"}
          sub={formWeekends ? `pts ${lastWeekends(formWeekends)}` : "sem etapa disputada"}
        />
        <StatTile
          label="Ritmo"
          value={stats.ritmo === null ? "—" : percent(stats.ritmo)}
          sub={stats.ritmo !== null && "da melhor volta, em média"}
        />
        <StatTile
          label="Aproveitamento"
          value={performance ? decimal(performance.pointsPerSession) : "—"}
          sub={performance && `pts por sessão · pontuou em ${percent(performance.scoringRate, 0)}`}
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {(
          [
            ["Maior sequência pontuando", sequencias.scoring],
            ["Maior sequência no pódio", sequencias.podium],
            ["Maior sequência vencendo", sequencias.win],
          ] as const
        ).map(([label, sequencia]) => (
          <StatTile
            key={label}
            label={label}
            value={sequencia.best}
            sub={`atual: ${plural(sequencia.current, "corrida", "corridas")}`}
          />
        ))}
      </div>

      {/* Comparativo com a Temporada passada: carrega à parte e, se falhar, some. */}
      <HideOnError>
        <Suspense fallback={null}>
          <DriverSeasonComparison season={data.season} driverId={id} />
        </Suspense>
      </HideOnError>

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
        <SeasonStrip
          season={data.season}
          cells={sessions.map(({ session: s, result: r }) => ({
            session: s,
            value: r.position,
            position: r.position,
            points: r.points,
            title: `${s.name} — ${ordinal(r.position)}`,
          }))}
        />
      </section>

      {(duels.length > 0 || license) && (
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {duels.map((d) => (
            <TeammateDuel
              key={d.id}
              label="Duelo com companheiro de equipe"
              first={{ name: standing.driver_name, ahead: d.ahead }}
              second={{
                name: (
                  <Link href={`/${data.season}/pilotos/${d.id}`} className="hover:underline">
                    {data.drivers[d.id]?.name}
                  </Link>
                ),
                ahead: d.behind,
              }}
            />
          ))}
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
            {sessions.map(({ session: s, result: r, total }) => {
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

/** Conversão de pole como "X de Y", nunca em porcentagem. */
function poleConversion({ converted, poles }: { converted: number; poles: number }): string {
  return `${converted} de ${poles} ${converted === 1 ? "virou" : "viraram"} vitória`;
}
