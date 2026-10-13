"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";

export interface ChartSession {
  label: string;
  round: number;
  isSprint: boolean;
}

export interface ChartSeries {
  id: number;
  name: string;
  /** Cor da equipe atual do piloto. */
  color: string;
  /** Companheiro de equipe atrás na classificação: mesma cor, linha tracejada. */
  dashed: boolean;
  cumulative: number[];
}

// Até 3 pilotos em destaque, na cor da equipe; o resto fica cinza ao fundo.
const MAX_HIGHLIGHT = 3;
const REST = "var(--series-rest)";
const DASH = "6 4";

/** Amostra de traço usada na legenda e no tooltip (espelha a linha do gráfico). */
function LineKey({ color, dashed }: { color: string; dashed: boolean }) {
  return (
    <svg width="16" height="4" aria-hidden className="shrink-0">
      <line
        x1="1"
        x2="15"
        y1="2"
        y2="2"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeDasharray={dashed ? "3 3" : undefined}
      />
    </svg>
  );
}
const HEIGHT = 340;
const M = { top: 16, right: 104, bottom: 32, left: 40 };

function niceStep(max: number, target = 5) {
  const raw = max / target;
  const pow = 10 ** Math.floor(Math.log10(raw || 1));
  const n = raw / pow;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * pow;
}

export function PointsChart({
  sessions,
  series,
}: {
  sessions: ChartSession[];
  series: ChartSeries[];
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(800);
  // Pilotos em destaque, do mais antigo para o mais recente.
  const [selected, setSelected] = useState<number[]>(() =>
    series.slice(0, MAX_HIGHLIGHT).map((s) => s.id),
  );
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const n = sessions.length;
  const plotW = Math.max(width - M.left - M.right, 10);
  const plotH = HEIGHT - M.top - M.bottom;
  const max = Math.max(1, ...series.map((s) => s.cumulative[n - 1] ?? 0));
  const step = niceStep(max);
  const yMax = Math.ceil(max / step) * step;
  const x = (i: number) => M.left + (n <= 1 ? plotW / 2 : (i / (n - 1)) * plotW);
  const y = (v: number) => M.top + plotH - (v / yMax) * plotH;

  const isOn = (id: number) => selected.includes(id);

  const toggle = (id: number) => {
    if (isOn(id)) setSelected(selected.filter((s) => s !== id));
    // Cheio: o destaque mais antigo sai para o novo entrar.
    else setSelected([...selected, id].slice(-MAX_HIGHLIGHT));
  };

  const yTicks: number[] = [];
  for (let v = 0; v <= yMax; v += step) yTicks.push(v);

  // Rótulos do eixo X: número da etapa, uma vez por fim de semana, espaçados.
  const xTicks: { i: number; round: number }[] = [];
  let lastTickX = -Infinity;
  for (let i = 0; i < n; i++) {
    if (i > 0 && sessions[i - 1].round === sessions[i].round) continue;
    if (x(i) - lastTickX >= 28) {
      xTicks.push({ i, round: sessions[i].round });
      lastTickX = x(i);
    }
  }

  const highlighted = series.filter((s) => isOn(s.id));
  const background = series.filter((s) => !isOn(s.id));

  // Rótulos no fim das linhas destacadas; se encostarem, afasta com linha-guia.
  const endLabels = highlighted
    .map((s) => ({ s, y0: y(s.cumulative[n - 1] ?? 0), yy: 0 }))
    .sort((a, b) => a.y0 - b.y0);
  for (let i = 0; i < endLabels.length; i++) {
    const prev = i ? endLabels[i - 1].yy : -Infinity;
    endLabels[i].yy = Math.max(endLabels[i].y0, prev + 15);
  }

  const pathOf = (vals: number[]) =>
    vals.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join("");

  const onMove = (e: PointerEvent<SVGRectElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const i = n <= 1 ? 0 : Math.round((px / rect.width) * (n - 1));
    setHover(Math.min(n - 1, Math.max(0, i)));
  };

  const onKey = (e: KeyboardEvent<SVGSVGElement>) => {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      const d = e.key === "ArrowRight" ? 1 : -1;
      setHover((h) => Math.min(n - 1, Math.max(0, (h ?? (d > 0 ? -1 : n)) + d)));
    } else if (e.key === "Escape") setHover(null);
  };

  const hoverRows =
    hover === null
      ? []
      : [...series]
          .map((s) => ({ s, v: s.cumulative[hover] ?? 0 }))
          .sort((a, b) => b.v - a.v);
  const tipLeft = hover === null ? 0 : x(hover);
  const tipOnLeft = tipLeft > width / 2;

  return (
    <div>
      <div ref={wrapRef} className="relative">
        <svg
          viewBox={`0 0 ${width} ${HEIGHT}`}
          role="img"
          aria-label="Pontos acumulados de cada piloto ao longo da temporada. Use as setas para navegar pelas etapas."
          tabIndex={0}
          onKeyDown={onKey}
          onBlur={() => setHover(null)}
          className="block h-auto w-full outline-none focus-visible:ring-2 focus-visible:ring-text-2 rounded-lg"
        >
          {yTicks.map((t) => (
            <g key={t}>
              <line
                x1={M.left}
                x2={M.left + plotW}
                y1={y(t)}
                y2={y(t)}
                stroke="var(--line)"
                strokeWidth={1}
              />
              <text
                x={M.left - 8}
                y={y(t)}
                dy="0.32em"
                textAnchor="end"
                className="tabular fill-muted text-[11px]"
              >
                {t}
              </text>
            </g>
          ))}
          {xTicks.map((t) => (
            <text
              key={t.i}
              x={x(t.i)}
              y={HEIGHT - 10}
              textAnchor="middle"
              className="tabular fill-muted text-[11px]"
            >
              R{t.round}
            </text>
          ))}

          {background.map((s) => (
            <path
              key={s.id}
              d={pathOf(s.cumulative)}
              fill="none"
              stroke={REST}
              strokeWidth={1.5}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          ))}
          {highlighted.map((s) => (
            <path
              key={s.id}
              d={pathOf(s.cumulative)}
              fill="none"
              stroke={s.color}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
              strokeDasharray={s.dashed ? DASH : undefined}
            />
          ))}
          {endLabels.map(({ s, y0, yy }) => {
            const ex = x(n - 1);
            return (
              <g key={s.id}>
                {Math.abs(yy - y0) > 1 && (
                  <line x1={ex + 6} y1={y0} x2={ex + 14} y2={yy} stroke="var(--muted)" strokeWidth={1} />
                )}
                <circle cx={ex} cy={y0} r={4} fill={s.color} stroke="var(--surface)" strokeWidth={2} />
                <text x={ex + 16} y={yy} dy="0.32em" className="fill-text text-[12px] font-bold">
                  {s.name}
                  <tspan className="tabular fill-text-2 font-normal"> {s.cumulative[n - 1]}</tspan>
                </text>
              </g>
            );
          })}

          {hover !== null && (
            <g pointerEvents="none">
              <line
                x1={x(hover)}
                x2={x(hover)}
                y1={M.top}
                y2={M.top + plotH}
                stroke="var(--text-2)"
                strokeWidth={1}
              />
              {highlighted.map((s) => (
                <circle
                  key={s.id}
                  cx={x(hover)}
                  cy={y(s.cumulative[hover] ?? 0)}
                  r={4}
                  fill={s.color}
                  stroke="var(--surface)"
                  strokeWidth={2}
                />
              ))}
            </g>
          )}
          <rect
            x={M.left}
            y={M.top}
            width={plotW}
            height={plotH}
            fill="transparent"
            onPointerMove={onMove}
            onPointerLeave={() => setHover(null)}
          />
        </svg>

        {hover !== null && (
          <div
            className="pointer-events-none absolute top-2 z-10 w-52 rounded-lg border border-line bg-bg/95 p-3 shadow-xl"
            style={
              tipOnLeft
                ? { right: width - tipLeft + 12 }
                : { left: tipLeft + 12 }
            }
          >
            <p className="text-xs font-bold uppercase tracking-wider text-muted">
              R{sessions[hover].round} · {sessions[hover].label}
              {sessions[hover].isSprint && " · Sprint"}
            </p>
            <ul className="mt-2 space-y-1">
              {hoverRows.map(({ s, v }) => (
                <li key={s.id} className="flex items-center gap-2 text-sm">
                  <LineKey color={isOn(s.id) ? s.color : REST} dashed={isOn(s.id) && s.dashed} />
                  <span className="tabular w-8 font-bold">{v}</span>
                  <span className={isOn(s.id) ? "text-text" : "text-text-2"}>
                    {s.name}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Pilotos em destaque (até 3)">
        {series.map((s) => {
          const on = isOn(s.id);
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => toggle(s.id)}
              aria-pressed={on}
              className={`flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-semibold transition-colors ${
                on
                  ? "border-text-2 bg-surface-2 text-text"
                  : "border-line text-muted hover:text-text"
              }`}
            >
              <LineKey color={on ? s.color : REST} dashed={on && s.dashed} />
              {s.name}
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-muted">
        Toque nos nomes para destacar até 3 pilotos. A tabela de classificação traz os valores exatos.
      </p>
    </div>
  );
}
