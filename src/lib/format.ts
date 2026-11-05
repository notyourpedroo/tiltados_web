const MONTHS = [
  "jan", "fev", "mar", "abr", "mai", "jun",
  "jul", "ago", "set", "out", "nov", "dez",
];

/** "2026-03-09" → "09 mar 2026" (sem passar por Date, para não depender de fuso). */
export function formatDate(iso: string, withYear = true): string {
  const [y, m, d] = iso.split("-");
  const month = MONTHS[Number(m) - 1] ?? m;
  return withYear ? `${d} ${month} ${y}` : `${d} ${month}`;
}

export function ordinal(position: number): string {
  return `${position}º`;
}

/** A janela da Forma recente em texto: "nas últimas 3 etapas", "na última etapa". */
export function lastWeekends(n: number): string {
  return n === 1 ? "na última etapa" : `nas últimas ${n} etapas`;
}

export function plural(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`;
}

const PERCENT = new Intl.NumberFormat("pt-BR", {
  style: "percent",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

/** 0.012 → "1,2%" (padrão brasileiro, uma casa decimal). */
export function percent(fraction: number): string {
  return PERCENT.format(fraction).replace(/\s/g, "");
}
