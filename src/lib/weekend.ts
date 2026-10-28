import type { Session } from "./season";

/** Uma Etapa: a Corrida e a Sprint do fim de semana que já têm resultado. */
export interface Weekend {
  round: number;
  race?: Session;
  sprint?: Session;
}

/** Agrupa as Sessões disputadas por Etapa, na ordem das Etapas. */
export function weekends(sessions: Session[]): Weekend[] {
  const byRound = new Map<number, Weekend>();
  for (const s of sessions) {
    const weekend = byRound.get(s.round) ?? { round: s.round };
    if (s.isSprint) weekend.sprint = s;
    else weekend.race = s;
    byRound.set(s.round, weekend);
  }
  return [...byRound.values()];
}
