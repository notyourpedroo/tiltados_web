import type { SeasonAverages } from "@/lib/driver-season";
import { decimal, percent } from "@/lib/format";
import { Card } from "./ui";

interface Row {
  label: string;
  value: (a: SeasonAverages) => number | null;
  format: (n: number) => string;
  /** Maior é melhor (pontos, vitórias, pódios) ou menor é melhor (chegada, Ritmo). */
  higherIsBetter: boolean;
}

const ROWS: Row[] = [
  { label: "Pontos por sessão", value: (a) => a.pointsPerSession, format: (n) => decimal(n), higherIsBetter: true },
  { label: "Vitórias em corridas", value: (a) => a.raceWinRate, format: (n) => percent(n, 0), higherIsBetter: true },
  { label: "Pódios", value: (a) => a.podiumRate, format: (n) => percent(n, 0), higherIsBetter: true },
  { label: "Chegada média", value: (a) => a.avgFinish, format: (n) => decimal(n), higherIsBetter: false },
  { label: "Ritmo", value: (a) => a.ritmo, format: (n) => percent(n), higherIsBetter: false },
];

/**
 * Médias por Sessão do piloto na temporada atual até agora contra a Temporada
 * passada inteira, com a indicação de melhora ou piora em cada uma.
 */
export function SeasonComparison({
  season,
  previousSeason,
  current,
  previous,
}: {
  /** Temporada atual, ex.: "2026". */
  season: string;
  /** Temporada passada, ex.: "2025". */
  previousSeason: string;
  current: SeasonAverages;
  previous: SeasonAverages;
}) {
  return (
    <Card className="p-5">
      <p className="text-xs font-bold uppercase tracking-wider text-muted">
        Comparativo com {previousSeason}
      </p>
      <table className="mt-2 w-full text-sm">
        <thead>
          <tr className="text-xs font-bold uppercase tracking-wider text-muted">
            <th className="py-1 text-left font-bold">Média</th>
            <th className="py-1 text-right font-bold">{previousSeason}</th>
            <th className="py-1 text-right font-bold">{season}</th>
            <th className="py-1 text-right font-bold">
              <span className="sr-only">Evolução</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row) => {
            const before = row.value(previous);
            const now = row.value(current);
            return (
              <tr key={row.label} className="border-t border-line">
                <td className="py-2 font-bold">{row.label}</td>
                <td className="tabular py-2 text-right text-text-2">
                  {before === null ? "—" : row.format(before)}
                </td>
                <td className="tabular py-2 text-right font-black">
                  {now === null ? "—" : row.format(now)}
                </td>
                <td className="py-2 pl-3 text-right text-xs text-text-2 whitespace-nowrap">
                  <Trend row={row} before={before} now={now} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="mt-2 text-xs text-muted">
        {season} até agora contra {previousSeason} inteira, sempre por sessão disputada
      </p>
    </Card>
  );
}

/** Melhora ou piora, comparando os valores como aparecem na tela. */
function Trend({ row, before, now }: { row: Row; before: number | null; now: number | null }) {
  if (before === null || now === null) return null;
  if (row.format(before) === row.format(now)) return <>= igual</>;
  const better = row.higherIsBetter ? now > before : now < before;
  return <>{better ? "▲ melhor" : "▼ pior"}</>;
}
