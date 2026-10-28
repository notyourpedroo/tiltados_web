import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  Card,
  PageTitle,
  SectionTitle,
  Skeleton,
  Table,
  TeamBar,
  TeamLogo,
  TeamMark,
  td,
  th,
  tr,
} from "@/components/ui";
import { getPunishments, getSuperLicense } from "@/lib/api";
import { formatDate, plural } from "@/lib/format";
import { describeLicense } from "@/lib/license";
import { teamStyle } from "@/lib/teams";

export const metadata: Metadata = { title: "Superlicença" };

export default function SuperLicensePage({ params }: PageProps<"/[season]/superlicenca">) {
  return (
    <Suspense fallback={<Skeleton rows={8} />}>
      {params.then(({ season }) => (
        <SuperLicense season={season} />
      ))}
    </Suspense>
  );
}

async function SuperLicense({ season }: { season: string }) {
  // A Superlicença só existe a partir de 2026.
  if (season !== "2026") notFound();
  const [licenses, punishments] = await Promise.all([getSuperLicense(), getPunishments()]);
  const sortedPunishments = [...punishments].sort((a, b) => b.race_date.localeCompare(a.race_date));

  return (
    <>
      <PageTitle eyebrow="Temporada 2026" title="Superlicença">
        Cada piloto começa com 12 pontos. Infrações descontam pontos da Superlicença: com 8 ou
        menos o piloto entra em atenção, com 4 ou menos em alerta crítico, e ao zerar é
        suspenso da próxima Corrida. Depois de cumprir a Suspensão, o saldo segue zerado, e a
        próxima punição gera uma nova.
      </PageTitle>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {licenses.map((l) => {
          const status = describeLicense(l.status);
          const team = teamStyle(l.team_name);
          const pct = Math.max(0, l.remaining_points / l.initial_points) * 100;
          return (
            <Card key={l.driver_id} className="p-5">
              <div className="flex items-center gap-2">
                <TeamBar color={team.color} />
                <Link
                  href={`/2026/pilotos/${l.driver_id}`}
                  className="text-lg font-black hover:underline"
                >
                  {l.driver_name}
                </Link>
                <span className="ml-auto flex items-center gap-1.5 text-xs text-muted">
                  {team.logo && <TeamLogo logo={team.logo} size={18} />}
                  {team.short}
                </span>
              </div>
              <p className="mt-3 text-4xl font-black">
                {l.remaining_points}
                <span className="text-lg text-muted"> / {l.initial_points}</span>
              </p>
              <div
                className="mt-2 h-2 overflow-hidden rounded-full"
                // Trilho do medidor: a cor do status a 20%.
                style={{ backgroundColor: `color-mix(in srgb, ${status.color} 20%, transparent)` }}
                role="meter"
                aria-valuemin={0}
                aria-valuemax={l.initial_points}
                aria-valuenow={l.remaining_points}
                aria-label={`Pontos restantes de ${l.driver_name}`}
              >
                <div
                  className="h-full rounded-full"
                  style={{ width: `${pct}%`, backgroundColor: status.color }}
                />
              </div>
              {/* Rótulo longo (Suspensão cumprida): a contagem de punições desce inteira de linha. */}
              <p className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                <span
                  aria-hidden
                  className="flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-black text-on-fill"
                  style={{ backgroundColor: status.color }}
                >
                  {status.icon}
                </span>
                <span className="font-bold">{status.label}</span>
                <span className="ml-auto whitespace-nowrap text-muted">
                  {l.punishments_count
                    ? plural(l.punishments_count, "punição", "punições")
                    : "sem punições"}
                </span>
              </p>
            </Card>
          );
        })}
      </div>

      <section className="mt-10">
        <SectionTitle>Punições registradas</SectionTitle>
        {sortedPunishments.length ? (
          <Table>
            <thead>
              <tr>
                <th className={th}>Data</th>
                <th className={th}>Grande Prêmio</th>
                <th className={th}>Piloto</th>
                <th className={th}>Motivo</th>
                <th className={`${th} text-right`}>Pontos</th>
              </tr>
            </thead>
            <tbody>
              {sortedPunishments.map((p) => (
                <tr key={`${p.driver_id}-${p.race_id}-${p.penalty_reason}`} className={tr}>
                  <td className={`${td} tabular whitespace-nowrap text-text-2`}>
                    {formatDate(p.race_date)}
                  </td>
                  <td className={td}>
                    <Link href={`/2026/corridas/${p.race_id}`} className="font-bold hover:underline">
                      {p.race_name}
                    </Link>
                  </td>
                  <td className={td}>
                    <span className="flex items-center gap-2 whitespace-nowrap">
                      <TeamMark team={teamStyle(p.team_name)} size={18} />
                      <span className="font-bold">{p.driver_name}</span>
                    </span>
                  </td>
                  <td className={`${td} text-text-2`}>{p.penalty_reason}</td>
                  <td className={`${td} tabular text-right font-black text-loss`}>
                    −{p.deduction_points}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <Card className="p-6 text-text-2">Nenhuma punição registrada até agora. 👏</Card>
        )}
      </section>
    </>
  );
}
