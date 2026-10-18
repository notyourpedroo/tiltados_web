// Tiltados F1 — propriedades dos componentes, copiadas de src/components (documentação).
import type { ReactNode } from "react";

/** Logo da equipe nas duas versões (src/lib/teams.ts). */
export interface TeamLogoSrc {
  /** Colorida, para o tema claro: /teams/<slug>.webp */
  light: string;
  /** Branca, para o tema escuro: /teams/<slug>-white.webp */
  dark: string;
}

/** Estrutura */
/** Sem propriedades. */
export type SiteHeaderProps = Record<string, never>;
/** Sem propriedades. */
export type ThemeToggleProps = Record<string, never>;
export interface PageTitleProps {
  /** Sobretítulo curto em accent, ex.: "Temporada 2026". */
  eyebrow?: ReactNode;
  /** Nome da página, escrito em caixa normal (o componente põe em caixa alta). */
  title: ReactNode;
  /** Subtítulo em text-2. */
  children?: ReactNode;
}
export interface SectionTitleProps {
  children: ReactNode;
  /** Ação à direita, normalmente um MoreLink. */
  action?: ReactNode;
}
export interface MoreLinkProps {
  href: string;
  children: ReactNode;
}
export interface CardProps {
  children: ReactNode;
  /** Padding e extras (stripe, relative…). */
  className?: string;
}
export interface TableProps {
  /** <thead> e <tbody>, com as classes exportadas th, td e tr. */
  children: ReactNode;
  /** Mínimo de 560px com rolagem própria. Padrão: true. */
  wide?: boolean;
}
export interface SkeletonProps {
  /** Linhas do esqueleto. Padrão: 6. */
  rows?: number;
}

/** Dados */
export interface PositionProps {
  value: number;
}
export interface GainedProps {
  /** Grid menos posição final: positivo ganhou, negativo perdeu. */
  value: number;
}
export interface StatTileProps {
  label: ReactNode;
  value: ReactNode;
  sub?: ReactNode;
}
export interface TeamBarProps {
  /** Cor team-* da equipe (var(--team-…)). */
  color: string;
  /** Altura (Tailwind). Padrão: "h-5" (20px). */
  className?: string;
}
export interface TeamLogoProps {
  logo: TeamLogoSrc;
  /** Lado em px. Padrão: 20. */
  size?: number;
  className?: string;
}
export interface TeamMarkProps {
  /** Logo da equipe ou, sem logo, a barrinha na cor dela. */
  team?: { color: string; logo?: TeamLogoSrc };
  size?: number;
}
/** Sem propriedades. */
export type SprintBadgeProps = Record<string, never>;
/** Sem propriedades. */
export type FastestLapBadgeProps = Record<string, never>;

/** Classificação */
export interface DriverStandingsTableProps {
  /** Temporada derivada (SeasonData, de getSeason em src/lib/season.ts). */
  data: unknown;
  limit?: number;
  /** Versão resumida da Visão geral. Padrão: false. */
  compact?: boolean;
}
export interface TeamStandingsTableProps {
  data: unknown;
  compact?: boolean;
}

/** Gráficos */
export interface ChartSession {
  label: string;
  round: number;
  isSprint: boolean;
}
export interface ChartSeries {
  id: number;
  name: string;
  /** Cor team-* da equipe atual. */
  color: string;
  /** Companheiro atrás na classificação: linha tracejada. */
  dashed: boolean;
  /** Pontos acumulados após cada sessão. */
  cumulative: number[];
  /** Posição no campeonato após cada sessão. */
  positions: number[];
}
export type ChartMode = "points" | "position";
export interface ProgressionChartProps {
  mode: ChartMode;
  sessions: ChartSession[];
  series: ChartSeries[];
  /** Ids em destaque (até 3), de useHighlight(series). */
  selected: number[];
  onToggle: (id: number) => void;
}
export interface ChampionshipChartsProps {
  sessions: ChartSession[];
  series: ChartSeries[];
}
