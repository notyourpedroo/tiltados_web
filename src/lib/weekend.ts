import type { Session } from "./season";

/** Uma Etapa: a Corrida e a Sprint disputadas no fim de semana (ao menos uma das duas). */
export interface Weekend {
  round: number;
  race?: Session;
  sprint?: Session;
}

/** Agrupa as Sessões disputadas por Etapa, na ordem em que as Etapas aparecem. */
export function weekends(sessions: Session[]): Weekend[] {
  const byRound = new Map<number, Weekend>();
  for (const s of sessions) {
    const weekend = byRound.get(s.round) ?? { round: s.round };
    if (s.isSprint) weekend.sprint ??= s;
    else weekend.race ??= s;
    byRound.set(s.round, weekend);
  }
  return [...byRound.values()];
}

/** A Sessão que representa a Etapa: a Corrida, ou a Sprint enquanto a Corrida está pendente. */
export function mainSession(weekend: Weekend): Session {
  return (weekend.race ?? weekend.sprint)!;
}
