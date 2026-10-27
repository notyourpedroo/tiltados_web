import type { TitleStatus } from "./types";

/** Quem disputa o título: um piloto ou uma equipe (muda a concordância dos rótulos). */
export type Entrant = "driver" | "team";

/** Tom do selo de status, que define a cor (Campeão dourado, Na disputa destaque, Eliminado apagado). */
export type BadgeTone = "champion" | "contention" | "eliminated";

export interface ChanceView {
  /** Chance de título como exibida ("87,3%"). */
  text: string;
  /** Largura da barra, em porcentagem. */
  bar: number;
  badge: { label: string; tone: BadgeTone };
  /** Eliminados aparecem esmaecidos. */
  dimmed: boolean;
}

const BADGES: Record<TitleStatus, { label: string; tone: BadgeTone }> = {
  Campeao: { label: "Campeão", tone: "champion" },
  "Na disputa": { label: "Na disputa", tone: "contention" },
  Eliminado: { label: "Eliminado", tone: "eliminated" },
};

function chanceText(status: TitleStatus, p: number): string {
  // Na disputa, 0 e 100 vêm do arredondamento: ainda não é Eliminado nem Campeão.
  if (status === "Na disputa" && p === 0) return "< 0,1%";
  if (status === "Na disputa" && p === 100) return "> 99,9%";
  return `${p.toString().replace(".", ",")}%`;
}

/** Como a Chance de título de um piloto ou equipe aparece na tela. */
export function describeChance(
  row: { status: TitleStatus; championship_probability: number },
  entrant: Entrant,
): ChanceView {
  return {
    text: chanceText(row.status, row.championship_probability),
    bar: row.championship_probability,
    badge: BADGES[row.status],
    dimmed: row.status === "Eliminado",
  };
}

/** Um campeonato (pilotos ou construtores) como aparece na tela, na ordem da API. */
export function describeTitleRace<T extends { status: TitleStatus; championship_probability: number }>(
  rows: T[],
  entrant: Entrant,
): { rows: (T & { view: ChanceView })[] } {
  return { rows: rows.map((row) => ({ ...row, view: describeChance(row, entrant) })) };
}
