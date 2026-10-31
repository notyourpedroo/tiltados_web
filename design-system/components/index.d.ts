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
  /** Carro da equipe, de `teamCar(nome, temporada)`, no arranjo do WithTeamCar. Ex.: perfil do piloto. Sem Carro, o título fica como sempre. */
  car?: string;
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
export interface TeamCarProps {
  /** Carro da equipe no Jogo da temporada, de `teamCar(nome, temporada)`: /cars/<ano do Carro>/<slug>.webp. Sem Carro, não desenha nada. */
  car?: string;
  /** Largura máxima em px; a imagem encolhe até caber. Padrão: 320. */
  width?: number;
  className?: string;
}
export interface WithTeamCarProps {
  /** Carro da equipe, de `teamCar(nome, temporada)`: à direita do nome, até 320px e alinhado à base, a partir de 640px; abaixo dele no celular. Sem Carro, só o nome. */
  car?: string;
  /** O bloco do nome (rótulo, nome, equipe). */
  children: ReactNode;
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
export interface DriverPositionBadgeProps {
  /** Primeiro nome do piloto. */
  name: string;
  /** Posição de chegada na Sessão; o selo escreve o ordinal ("2º"). */
  position: number;
}

/** Chance de título (src/components/chance.tsx) */
export interface ChanceView {
  /** Chance de título como exibida ("87,3%", "< 0,1%", "> 99,9%"). */
  text: string;
  /** Largura da barra, em porcentagem. */
  bar: number;
  /** Rótulo concordando com piloto ou equipe; o tom define a cor. */
  badge: { label: string; tone: "champion" | "contention" | "eliminated" };
  /** Eliminados aparecem esmaecidos. */
  dimmed: boolean;
}
export interface ChanceBadgeProps {
  view: ChanceView;
}
export interface ChanceBarProps {
  view: ChanceView;
  /** Rótulo acessível do medidor. */
  label: string;
}
export interface ChanceRowProps {
  view: ChanceView;
  /** Nome (com link, para pilotos). */
  name: ReactNode;
  /** Marca da equipe (TeamMark). */
  mark: ReactNode;
  /** Equipe atual, para pilotos. */
  team?: ReactNode;
  /** Carro da equipe no Jogo da temporada, de `teamCar(nome, temporada)`. Aparece a partir de 640px; sem Carro, a linha fica como antes. */
  car?: string;
  points: number;
  maxPoints: number;
  /** Motivo da Chance de título. */
  reason: string;
  /** Título decidido: sem barra nem porcentagem, com o Motivo em destaque. */
  decided: boolean;
}

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
  /** Cor team-* da equipe (a atual, no caso de um piloto). */
  color: string;
  /** Piloto com companheiro à frente na classificação: linha tracejada. */
  dashed: boolean;
  /** Pontos acumulados após cada sessão. */
  cumulative: number[];
  /** Posição no campeonato após cada sessão. */
  positions: number[];
}
export type ChartMode = "points" | "position";
/** Pilotos (chartData) ou equipes (constructorsProgression); muda o texto acessível e a dica. */
export type ChartKind = "driver" | "team";
export interface ProgressionChartProps {
  mode: ChartMode;
  kind: ChartKind;
  sessions: ChartSession[];
  series: ChartSeries[];
  /** Ids em destaque (até 3), de useHighlight(series). */
  selected: number[];
  onToggle: (id: number) => void;
}
export interface ChampionshipChartsProps {
  kind: ChartKind;
  sessions: ChartSession[];
  series: ChartSeries[];
}

/** Padrões de página */
export interface TeammateDuelSide {
  /** Nome do piloto, com link quando leva a outro perfil. */
  name: ReactNode;
  /** Vezes em que chegou na frente do outro. */
  ahead: number;
}
export interface TeammateDuelProps {
  /** "Duelo com companheiro de equipe" (piloto) ou "Duelo entre companheiros de equipe" (equipe). */
  label: string;
  /** Primeiro piloto: a barra mostra a parte dele. */
  first: TeammateDuelSide;
  second: TeammateDuelSide;
}
export interface LicenseCardProps {
  /** Linha da rota de Superlicença da API (ApiSuperLicense em src/lib/types.ts). */
  license: unknown;
}
export interface TeamDriverRow {
  id: number;
  name: string;
  /** Pontos que o piloto fez pela equipe, e só por ela. */
  points: number;
  /** Da Dupla (a equipe do piloto no cadastro): fica em destaque. */
  inDupla: boolean;
}
export interface TeamDriversProps {
  season: string;
  /** Pilotos da equipe, do maior pontuador para o menor (teamProfile em src/lib/team-season.ts). */
  drivers: TeamDriverRow[];
}
