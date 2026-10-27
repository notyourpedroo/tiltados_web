import type { ReactNode } from "react";
import type { BadgeTone, ChanceView } from "@/lib/chance";

// Campeão no dourado das medalhas, Na disputa no destaque e Eliminado apagado.
// Não reaproveita os status-* da Superlicença, que têm significado disciplinar.
const BADGE_STYLE: Record<BadgeTone, string> = {
  champion: "bg-gold-fill text-on-fill",
  contention: "bg-accent text-on-accent",
  eliminated: "bg-surface-2 text-muted",
};

const BAR_STYLE: Record<BadgeTone, string> = {
  champion: "bg-gold-fill",
  contention: "bg-accent",
  eliminated: "bg-muted",
};

/** Selo do status no título (Campeão, Na disputa, Eliminado). */
export function ChanceBadge({ view }: { view: ChanceView }) {
  return (
    <span
      className={`whitespace-nowrap rounded px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
        BADGE_STYLE[view.badge.tone]
      }`}
    >
      {view.badge.label}
    </span>
  );
}

/** Barra proporcional à Chance de título. */
export function ChanceBar({ view, label }: { view: ChanceView; label: string }) {
  return (
    <div
      className="h-1.5 overflow-hidden rounded-full bg-surface-2"
      role="meter"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={view.bar}
      aria-valuetext={view.text}
      aria-label={label}
    >
      <div
        className={`h-full rounded-full ${BAR_STYLE[view.badge.tone]}`}
        style={{ width: `${view.bar}%` }}
      />
    </div>
  );
}

/** Linha de um piloto ou equipe na página Chance de título. */
export function ChanceRow({
  view,
  name,
  mark,
  team,
  points,
  maxPoints,
  reason,
}: {
  view: ChanceView;
  /** Nome (com link, para pilotos). */
  name: ReactNode;
  /** Marca da equipe. */
  mark: ReactNode;
  /** Equipe atual, para pilotos. */
  team?: ReactNode;
  points: number;
  maxPoints: number;
  reason: string;
}) {
  return (
    <li className={`border-t border-line px-4 py-4 first:border-t-0 ${view.dimmed ? "opacity-60" : ""}`}>
      <div className="flex items-center gap-2">
        {mark}
        <span className="min-w-0 truncate text-lg font-black">{name}</span>
        {team && <span className="hidden text-sm text-muted sm:inline">{team}</span>}
        <span className="tabular ml-auto text-2xl font-black">{view.text}</span>
      </div>
      <div className="mt-2">
        <ChanceBar view={view} label={`Chance de título: ${view.text}`} />
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
        <ChanceBadge view={view} />
        <span className="tabular text-text-2">
          {points} pts <span aria-hidden>→</span>
          <span className="sr-only">, Pontos máximos:</span> {maxPoints} máx.
        </span>
      </div>
      <p className="mt-2 text-sm text-text-2">{reason}</p>
    </li>
  );
}
