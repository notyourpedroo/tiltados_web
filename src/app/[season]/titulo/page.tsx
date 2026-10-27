import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ChanceRow } from "@/components/chance";
import { Card, PageTitle, SectionTitle, Skeleton, TeamMark } from "@/components/ui";
import { getDriverPrediction, getTeamPrediction } from "@/lib/api";
import { describeTitleRace } from "@/lib/chance";
import { teamStyle } from "@/lib/teams";

export const metadata: Metadata = { title: "Chance de título" };

export default function TitleChancePage({ params }: PageProps<"/[season]/titulo">) {
  return (
    <Suspense fallback={<Skeleton rows={8} />}>
      {params.then(({ season }) => (
        <TitleChance season={season} />
      ))}
    </Suspense>
  );
}

/** Ninguém do campeonato está Na disputa: as barras somem e o Motivo vira o destaque. */
function DecidedTag() {
  return (
    <span className="text-sm font-bold uppercase tracking-wider text-gold">Título decidido</span>
  );
}

async function TitleChance({ season }: { season: string }) {
  // A Chance de título só existe a partir de 2026.
  if (season !== "2026") notFound();
  const [driverRows, teamRows] = await Promise.all([getDriverPrediction(), getTeamPrediction()]);
  const drivers = describeTitleRace(driverRows, "driver");
  const teams = describeTitleRace(teamRows, "team");

  return (
    <>
      <PageTitle eyebrow="Temporada 2026" title="Chance de título">
        Simulamos as sessões pendentes milhares de vezes, sorteando para cada piloto uma das
        posições que ele já fez em 2026. A Chance de título é a porcentagem de simulações em
        que ele termina campeão.
      </PageTitle>

      <section>
        <SectionTitle action={drivers.decided && <DecidedTag />}>Pilotos</SectionTitle>
        <Card>
          <ol>
            {drivers.rows.map((d) => {
              const team = teamStyle(d.team_name);
              return (
                <ChanceRow
                  key={d.driver_id}
                  view={d.view}
                  mark={<TeamMark team={team} />}
                  name={
                    <Link href={`/2026/pilotos/${d.driver_id}`} className="hover:underline">
                      {d.driver_name}
                    </Link>
                  }
                  team={team.short}
                  points={d.points}
                  maxPoints={d.max_points}
                  reason={d.probability_reason}
                  decided={drivers.decided}
                />
              );
            })}
          </ol>
        </Card>
      </section>

      <section className="mt-10">
        <SectionTitle action={teams.decided && <DecidedTag />}>Construtores</SectionTitle>
        <Card>
          <ol>
            {teams.rows.map((t) => (
              <ChanceRow
                key={t.team_id}
                view={t.view}
                mark={<TeamMark team={teamStyle(t.team_name)} />}
                name={t.team_name}
                points={t.points}
                maxPoints={t.max_points}
                reason={t.probability_reason}
                decided={teams.decided}
              />
            ))}
          </ol>
        </Card>
      </section>
    </>
  );
}
