// Nome do piloto para a tela. Fica fora de season.ts, que é só do servidor, para
// servir também a módulos testados com o Vitest (chart.ts).
import type { SeasonData } from "./season";

/** Nome do piloto no cadastro; `#<id>` quando ele não está lá. */
export function driverName(data: Pick<SeasonData, "drivers">, id: number): string {
  return data.drivers[id]?.name ?? `#${id}`;
}
