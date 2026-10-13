import Link from "next/link";
import type { ReactNode } from "react";

export function PageTitle({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="mb-8">
      {eyebrow && (
        <p className="mb-1 text-sm font-bold uppercase tracking-widest text-accent">
          {eyebrow}
        </p>
      )}
      <h1 className="text-3xl font-black uppercase leading-none tracking-tight sm:text-5xl">
        {title}
      </h1>
      {children && <div className="mt-3 text-text-2">{children}</div>}
    </div>
  );
}

export function SectionTitle({
  children,
  action,
}: {
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="mb-3 flex items-end justify-between gap-4">
      <h2 className="text-lg font-black uppercase tracking-tight sm:text-xl">
        {children}
      </h2>
      {action}
    </div>
  );
}

export function MoreLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="text-sm font-bold text-text-2 transition-colors hover:text-text"
    >
      {children} <span aria-hidden>→</span>
    </Link>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-xl border border-line bg-surface ${className}`}>
      {children}
    </div>
  );
}

export function TeamBar({ color, className = "h-5" }: { color: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={`inline-block w-1 shrink-0 rounded-full ${className}`}
      style={{ backgroundColor: color }}
    />
  );
}

const PODIUM = ["text-gold", "text-silver", "text-bronze"];

export function Position({ value }: { value: number }) {
  return (
    <span
      className={`tabular font-black ${PODIUM[value - 1] ?? "text-text"}`}
    >
      {value}
    </span>
  );
}

export function Gained({ value }: { value: number }) {
  if (value === 0)
    return <span className="tabular text-muted" aria-label="Sem alteração">–</span>;
  const up = value > 0;
  return (
    <span
      className={`tabular font-bold ${up ? "text-gain" : "text-loss"}`}
      aria-label={`${up ? "Ganhou" : "Perdeu"} ${Math.abs(value)} posições`}
    >
      {up ? "▲" : "▼"} {Math.abs(value)}
    </span>
  );
}

export function StatTile({
  label,
  value,
  sub,
}: {
  label: ReactNode;
  value: ReactNode;
  sub?: ReactNode;
}) {
  return (
    <Card className="p-4">
      <p className="text-xs font-bold uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-1 text-3xl font-black leading-tight">{value}</p>
      {sub && <p className="mt-0.5 truncate text-sm text-text-2">{sub}</p>}
    </Card>
  );
}

export function SprintBadge() {
  return (
    <span className="rounded bg-surface-2 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-text-2">
      Sprint
    </span>
  );
}

export function FastestLapBadge() {
  return (
    <span
      title="Volta mais rápida"
      className="ml-2 inline-flex items-center rounded bg-purple/20 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-purple"
    >
      ⏱ VMR
    </span>
  );
}

/** Tabela base no estilo das páginas de resultado da F1. */
export function Table({
  children,
  wide = true,
}: {
  children: ReactNode;
  /** Tabelas largas ganham rolagem horizontal em telas estreitas. */
  wide?: boolean;
}) {
  return (
    <Card className="table-scroll">
      <table className={`w-full border-collapse text-sm ${wide ? "min-w-[560px]" : ""}`}>
        {children}
      </table>
    </Card>
  );
}

export const th =
  "px-3 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-muted first:pl-4 last:pr-4";
export const td = "px-3 py-3 first:pl-4 last:pr-4";
export const tr = "border-t border-line transition-colors hover:bg-surface-2";

export function Skeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="animate-pulse" aria-busy="true" aria-label="Carregando">
      <div className="mb-2 h-4 w-24 rounded bg-surface-2" />
      <div className="mb-8 h-12 w-2/3 rounded bg-surface-2" />
      <div className="space-y-2">
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="h-12 rounded-lg bg-surface" />
        ))}
      </div>
    </div>
  );
}
