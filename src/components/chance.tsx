import type { ReactNode } from "react";
import { Card, TeamCar } from "@/components/ui";
import type { BadgeTone, ChanceView } from "@/lib/chance";

// Campeão no dourado das medalhas (gold-fill com on-fill), Na disputa invertido como
// os itens ativos e Eliminado como o selo Sprint. O accent fica fora: o design system
// o reserva para faixa, logotipo, aba ativa e sobretítulos. Também não reaproveita os
// status-* da Superlicença, que têm significado disciplinar.
const BADGE_STYLE: Record<BadgeTone, string> = {
  champion: "bg-gold-fill text-on-fill",
  contention: "bg-text text-bg",
  eliminated: "bg-surface-2 text-text-2",
};

const BAR_STYLE: Record<BadgeTone, string> = {
  champion: "bg-gold-fill",
  contention: "bg-text",
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

/**
 * Card da Chance de título no perfil do piloto ou da equipe: rótulo e selo, a
 * porcentagem, a barra e o Motivo. Fica 16px abaixo da grade de estatísticas.
 */
export function TitleChanceCard({
  title,
  view,
  reason,
}: {
  /** "Chance de título" (piloto) ou "Chance de título de construtores" (equipe). */
  title: string;
  view: ChanceView;
  reason: string;
}) {
  return (
    <Card className="mt-4 p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-bold uppercase tracking-wider text-muted">{title}</p>
        <ChanceBadge view={view} />
      </div>
      <p className="tabular mt-1 text-2xl font-black">{view.text}</p>
      <div className="mt-2">
        <ChanceBar view={view} label={`${title}: ${view.text}`} />
      </div>
      <p className="mt-3 text-sm text-text-2">{reason}</p>
    </Card>
  );
}

/** Linha de um piloto ou equipe na página Chance de título. */
export function ChanceRow({
  view,
  name,
  mark,
  team,
  car,
  points,
  maxPoints,
  reason,
  decided,
}: {
  view: ChanceView;
  /** Nome (com link, para pilotos). */
  name: ReactNode;
  /** Marca da equipe. */
  mark: ReactNode;
  /** Equipe atual, para pilotos. */
  team?: ReactNode;
  /** Carro da equipe no Jogo da temporada, de `teamCar`. */
  car?: string;
  points: number;
  maxPoints: number;
  reason: string;
  /**
   * Título decidido: sem barra nem porcentagem (só mostrariam 100% e 0%); o selo
   * sobe para o lugar do número e o Motivo vira o conteúdo principal.
   */
  decided: boolean;
}) {
  // Esmaecido pela cor do texto (text-2), não por opacidade, para manter o contraste.
  const tone = view.dimmed ? "text-text-2" : "text-text";
  const pointsLine = (
    <span className="tabular text-text-2">
      {points} pts <span aria-hidden>→</span>
      <span className="sr-only">, Pontos máximos:</span> {maxPoints} máx.
    </span>
  );

  return (
    <li className="border-t border-line px-4 py-4 first:border-t-0">
      <div className="flex items-center gap-2">
        {mark}
        <span className={`min-w-0 truncate text-lg font-black ${tone}`}>{name}</span>
        {team && <span className="hidden text-sm text-muted sm:inline">{team}</span>}
        <span className="ml-auto flex shrink-0 items-center gap-3">
          {/* Carro numa coluna de 100 px junto ao número, só a partir de 640 px; sem Carro, nada ocupa o lugar. */}
          {car && (
            <span className="hidden w-25 sm:block">
              <TeamCar car={car} width={100} />
            </span>
          )}
          {decided ? (
            <ChanceBadge view={view} />
          ) : (
            <span className={`tabular text-2xl font-black ${tone}`}>{view.text}</span>
          )}
        </span>
      </div>
      {decided ? (
        <>
          <p className="mt-2 font-semibold text-text">{reason}</p>
          <p className="mt-1 text-sm">{pointsLine}</p>
        </>
      ) : (
        <>
          <div className="mt-2">
            <ChanceBar view={view} label={`Chance de título: ${view.text}`} />
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            <ChanceBadge view={view} />
            {pointsLine}
          </div>
          <p className="mt-2 text-sm text-text-2">{reason}</p>
        </>
      )}
    </li>
  );
}
