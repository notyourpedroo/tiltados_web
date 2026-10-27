// Formatos crus retornados pela Tiltados API.

export const SEASONS = ["2025", "2026"] as const;
export type Season = (typeof SEASONS)[number];

export function isSeason(value: string): value is Season {
  return (SEASONS as readonly string[]).includes(value);
}

export interface ApiDriver {
  driver_id: number;
  team_id: number;
  driver_name: string;
}

export interface ApiTeam {
  team_id: number;
  team_name: string;
}

export interface ApiRace {
  race_id: number;
  race_name: string;
  race_date: string;
  race_location: string;
  is_sprint: boolean;
}

export interface ApiResult {
  race_id: number;
  driver_id: number;
  team_id: number;
  driver_start_position: number;
  driver_final_position: number;
  grid_result: number;
  driver_fastest_lap: string;
}

export interface ApiDriverStanding {
  position: number;
  driver_id: number;
  driver_name: string;
  team_id: number;
  team_name: string;
  points: number;
  wins: number;
  sprint_wins: number;
  podiums: number;
  races: number;
}

export interface ApiTeamStanding {
  position: number;
  team_id: number;
  team_name: string;
  points: number;
  wins: number;
  podiums: number;
}

export interface ApiPunishment {
  season_year: number;
  driver_id: number;
  race_id: number;
  deduction_points: number;
  penalty_reason: string;
  driver_name: string;
  team_id: number;
  team_name: string;
  race_name: string;
  race_date: string;
}

export type LicenseStatus =
  | "Regular"
  | "Atencao"
  | "Alerta Critico"
  | "Suspenso (Ban)";

/** Situação no título pela matemática (Pontos máximos contra os pontos do líder). */
export type TitleStatus = "Campeao" | "Na disputa" | "Eliminado";

export interface ApiDriverPrediction {
  /** Ordem pela Chance de título, não a posição no campeonato. */
  position: number;
  driver_id: number;
  driver_name: string;
  team_id: number;
  team_name: string;
  points: number;
  max_points: number;
  status: TitleStatus;
  /** Chance de título, em porcentagem com 1 casa. */
  championship_probability: number;
  expected_points: number;
  probability_reason: string;
}

export interface ApiSuperLicense {
  driver_id: number;
  driver_name: string;
  team_id: number;
  team_name: string;
  initial_points: number;
  deducted_points: number;
  remaining_points: number;
  punishments_count: number;
  status: LicenseStatus;
}
