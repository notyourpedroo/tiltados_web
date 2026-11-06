import type { PreviousSeasonAverages, SeasonAverages } from "@/lib/driver-season";
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
 * Médias por Sessão do piloto em cada Temporada anterior inteira e na temporada
 * atual até agora, com a indicação de melhora ou piora contra a referência.
 */
export function SeasonComparison({
  season,
  current,
  previous,
  reference,
}: {
  /** Temporada atual, ex.: "2026". */
  season: string;
  current: SeasonAverages;
  /** Temporadas anteriores disputadas pelo piloto, em ordem cronológica. */
  previous: PreviousSeasonAverages[];
  /** Temporada anterior contra a qual a evolução compara: a mais recente disputada. */
  reference: PreviousSeasonAverages;
}) {
  return (
    <Card className="p-5">
      <p className="text-xs font-bold uppercase tracking-wider text-muted">Comparativo</p>
      <table className="mt-2 w-full text-sm">
        <thead>
          <tr className="text-xs font-bold uppercase tracking-wider text-muted">
            <th className="py-1 text-left font-bold">Média</th>
            {previous.map((p) => (
              <th key={p.season} className="py-1 text-right font-bold">
                {p.season}
              </th>
            ))}
            <th className="py-1 text-right font-bold">{season}</th>
            <th className="py-1 text-right font-bold">
              <span className="sr-only">Evolução</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row) => {
            const now = row.value(current);
            return (
              <tr key={row.label} className="border-t border-line">
                <td className="py-2 font-bold">{row.label}</td>
                {previous.map((p) => {
                  const value = row.value(p.averages);
                  return (
                    <td key={p.season} className="tabular py-2 text-right text-text-2">
                      {value === null ? "—" : row.format(value)}
                    </td>
                  );
                })}
                <td className="tabular py-2 text-right font-black">
                  {now === null ? "—" : row.format(now)}
                </td>
                <td className="py-2 pl-3 text-right text-xs text-text-2 whitespace-nowrap">
                  <Trend row={row} before={row.value(reference.averages)} now={now} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="mt-2 text-xs text-muted">
        {previous.length === 1
          ? `${season} até agora contra ${previous[0].season} inteira, sempre por sessão disputada`
          : `${season} até agora; temporadas anteriores inteiras, sempre por sessão disputada`}
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
