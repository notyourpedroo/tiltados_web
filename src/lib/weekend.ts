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

/** Etapas da janela da Forma recente. */
export const RECENT_FORM_WEEKENDS = 3;

/**
 * As Sessões das últimas 3 Etapas disputadas da temporada (Corrida e Sprint), a
 * janela da Forma recente. Com menos de 3 Etapas, todas entram.
 */
export function recentFormSessions(sessions: Session[]): Session[] {
  const rounds = new Set(
    weekends(sessions)
      .slice(-RECENT_FORM_WEEKENDS)
      .map((w) => w.round),
  );
  return sessions.filter((s) => rounds.has(s.round));
}

/** Quantas Etapas entram na janela da Forma recente: 3, ou as que houver. */
export function recentFormWeekends(sessions: Session[]): number {
  return Math.min(RECENT_FORM_WEEKENDS, weekends(sessions).length);
}

/** A Sessão que representa a Etapa: a Corrida, ou a Sprint enquanto a Corrida está pendente. */
export function mainSession(weekend: Weekend): Session {
  return (weekend.race ?? weekend.sprint)!;
}
