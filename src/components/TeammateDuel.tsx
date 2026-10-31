import type { ReactNode } from "react";
import { plural } from "@/lib/format";
import { Card } from "./ui";

export interface DuelSide {
  /** Nome do piloto, com link quando leva a outro perfil. */
  name: ReactNode;
  /** Vezes em que chegou na frente do outro. */
  ahead: number;
}

/**
 * Placar de quem chegou na frente entre dois companheiros de equipe, nas Sessões
 * em que os dois correram pela mesma equipe. A barra mostra a parte do primeiro.
 */
export function TeammateDuel({
  label,
  first,
  second,
}: {
  label: string;
  first: DuelSide;
  second: DuelSide;
}) {
  const sessions = first.ahead + second.ahead;
  return (
    <Card className="p-5">
      <p className="text-xs font-bold uppercase tracking-wider text-muted">{label}</p>
      <div className="mt-2 flex items-baseline justify-between gap-2 text-lg font-black">
        <span>
          {first.name} <span className="tabular">{first.ahead}</span>
        </span>
        <span className="text-muted">×</span>
        <span>
          <span className="tabular">{second.ahead}</span> {second.name}
        </span>
      </div>
      <div className="mt-3 flex h-2 gap-0.5 overflow-hidden rounded-full" aria-hidden>
        <div className="bg-text" style={{ width: `${(first.ahead / sessions) * 100}%` }} />
        <div className="flex-1 bg-surface-2" />
      </div>
      <p className="mt-2 text-xs text-muted">
        Quem chegou na frente, em {plural(sessions, "sessão", "sessões")} juntos
      </p>
    </Card>
  );
}
