import Link from "next/link";
import type { TeamDriver } from "@/lib/team-season";
import { Badge, Card } from "./ui";

/** Piloto da equipe com o nome a exibir. */
export type TeamDriverRow = TeamDriver & { name: string };

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
            {d.inDupla && <Badge>Dupla</Badge>}
            <span className="tabular ml-auto font-bold">
              {d.points} <span className="text-xs font-normal text-muted">pts</span>
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
