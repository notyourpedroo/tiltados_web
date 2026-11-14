import type { ComparisonTrend, SeasonComparisonData } from "@/lib/driver-season";
import { Card } from "./ui";

const TREND: Record<ComparisonTrend, string> = {
  melhor: "▲ melhor",
  pior: "▼ pior",
  igual: "= igual",
};

/**
 * Médias por Sessão do piloto em cada Temporada anterior inteira e na temporada
 * atual até agora, com a indicação de melhora ou piora contra a referência e o
 * melhor valor de cada linha em negrito. Só desenha as linhas prontas de
 * `seasonComparison`.
 */
export function SeasonComparison({ seasons, rows }: SeasonComparisonData) {
  const season = seasons.at(-1);
  const previous = seasons.slice(0, -1);
  return (
    <Card className="p-5">
      <p className="text-xs font-bold uppercase tracking-wider text-muted">Comparativo</p>
      <table className="mt-2 w-full text-sm">
        <thead>
          <tr className="text-xs font-bold uppercase tracking-wider text-muted">
            <th className="py-1 text-left font-bold">Média</th>
            {seasons.map((s) => (
              <th key={s} className="py-1 text-right font-bold">
                {s}
              </th>
            ))}
            <th className="py-1 text-right font-bold">
              <span className="sr-only">Evolução</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-t border-line">
              <td className="py-2 font-bold">{row.label}</td>
              {row.cells.map((cell, i) => (
                <td
                  key={cell.season}
                  className={`tabular py-2 text-right ${
                    i === row.cells.length - 1 ? "text-text" : "text-text-2"
                  } ${cell.best ? "font-black" : "font-normal"}`}
                >
                  {cell.text}
                </td>
              ))}
              <td className="py-2 pl-3 text-right text-xs text-text-2 whitespace-nowrap">
                {row.trend && TREND[row.trend]}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 text-xs text-muted">
        {previous.length === 1
          ? `${season} até agora contra ${previous[0]} inteira, sempre por sessão disputada`
          : `${season} até agora; temporadas anteriores inteiras, sempre por sessão disputada`}
      </p>
    </Card>
  );
}
