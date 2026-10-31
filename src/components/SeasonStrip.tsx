import Link from "next/link";
import type { Session } from "@/lib/season";
import { Card } from "./ui";

/** Uma célula da temporada em resumo: uma Sessão disputada. */
export interface SeasonStripCell {
  session: Session;
  /** Número da célula: a posição de chegada (piloto) ou os pontos (equipe). */
  value: number;
  /** Posição que dá a medalha: 1º, 2º e 3º viram ouro, prata e bronze. */
  position: number;
  /** Pontos na Sessão: com pontos a célula fica em surface-2, sem em bg. */
  points: number;
  /** Dica da célula, ex.: "GP de Mônaco — 1º" ou "GP de Mônaco — 43 pontos". */
  title: string;
}

const MEDAL: Record<number, string> = {
  1: "bg-gold-fill text-on-fill",
  2: "bg-silver-fill text-on-fill",
  3: "bg-bronze-fill text-on-fill",
};

/**
 * Temporada em resumo no perfil do piloto e no da equipe: uma célula de 40px por
 * Sessão, com a etapa ("R5" ou "SPR"), levando aos resultados dela.
 */
export function SeasonStrip({ season, cells }: { season: string; cells: SeasonStripCell[] }) {
  return (
    <Card className="p-4">
      <ol className="flex flex-wrap gap-1.5">
        {cells.map(({ session: s, value, position, points, title }) => (
          <li key={s.id}>
            <Link
              href={`/${season}/corridas/${s.id}`}
              title={title}
              className={`tabular flex h-10 w-10 flex-col items-center justify-center rounded-md text-sm font-black transition-transform hover:scale-110 ${
                MEDAL[position] ?? (points ? "bg-surface-2 text-text" : "bg-bg text-muted")
              }`}
            >
              {value}
              <span className="text-[8px] font-bold leading-none opacity-70">
                {s.isSprint ? "SPR" : `R${s.round}`}
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </Card>
  );
}
