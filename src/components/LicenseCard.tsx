import Link from "next/link";
import { plural } from "@/lib/format";
import { describeLicense } from "@/lib/license";
import { teamStyle } from "@/lib/teams";
import type { ApiSuperLicense } from "@/lib/types";
import { Card, TeamBar, TeamLogo } from "./ui";

/** Superlicença de um piloto em 2026: saldo, medidor e status, com link para o perfil. */
export function LicenseCard({ license: l }: { license: ApiSuperLicense }) {
  const status = describeLicense(l.status);
  const team = teamStyle(l.team_name);
  const pct = Math.max(0, l.remaining_points / l.initial_points) * 100;
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2">
        <TeamBar color={team.color} />
        <Link href={`/2026/pilotos/${l.driver_id}`} className="text-lg font-black hover:underline">
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
}
