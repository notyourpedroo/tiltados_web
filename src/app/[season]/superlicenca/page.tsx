import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { LicenseCard } from "@/components/LicenseCard";
import { Card, PageTitle, SectionTitle, Skeleton, Table, TeamMark, td, th, tr } from "@/components/ui";
import { getPunishments, getSuperLicense } from "@/lib/api";
import { formatDate } from "@/lib/format";
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
        {licenses.map((l) => (
          <LicenseCard key={l.driver_id} license={l} />
        ))}
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
