import Link from "next/link";
import { Card } from "./ui";

export interface TeamDriverRow {
  id: number;
  name: string;
  /** Pontos que o piloto fez pela equipe, e só por ela. */
  points: number;
  /** Da Dupla (a equipe do piloto no cadastro): fica em destaque. */
  inDupla: boolean;
}

/**
 * Pilotos da equipe na temporada, do maior pontuador para o menor, com os pontos
 * que cada um fez por ela. A Dupla vem em destaque, com o selo no padrão do
 * SprintBadge; quem só passou pela equipe fica em text-2.
 */
export function TeamDrivers({ season, drivers }: { season: string; drivers: TeamDriverRow[] }) {
  return (
    <Card>
      <ul>
        {drivers.map((d) => (
          <li
            key={d.id}
            className="flex items-center gap-2 border-t border-line px-4 py-3 first:border-t-0"
          >
            <Link
              href={`/${season}/pilotos/${d.id}`}
              className={`font-black hover:underline ${d.inDupla ? "text-lg text-text" : "text-text-2"}`}
            >
              {d.name}
            </Link>
            {d.inDupla && (
              <span className="rounded bg-surface-2 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-text-2">
                Dupla
              </span>
            )}
            <span className="tabular ml-auto font-bold">
              {d.points} <span className="text-xs font-normal text-muted">pts</span>
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
