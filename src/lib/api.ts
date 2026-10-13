import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type {
  ApiDriver,
  ApiDriverStanding,
  ApiPunishment,
  ApiRace,
  ApiResult,
  ApiSuperLicense,
  ApiTeam,
  ApiTeamStanding,
  Season,
} from "./types";

// A API é servida via HTTP puro, então ela é sempre consultada pelo servidor do
// Next (nunca pelo navegador) — assim o site pode rodar em HTTPS sem mixed content.
const API_URL = (
  process.env.TILTADOS_API_URL ?? "http://<ip-do-servidor>:8000"
).replace(/\/+$/, "");

async function get<T>(path: string): Promise<T> {
  "use cache";
  // Os dados mudam só quando um CSV novo de corrida é publicado na API.
  cacheLife("minutes");
  cacheTag("tiltados-api");

  const res = await fetch(`${API_URL}${path}`, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) {
    let detail = "";
    try {
      detail = ((await res.json()) as { detail?: string }).detail ?? "";
    } catch {}
    throw new Error(
      `Tiltados API ${path} respondeu ${res.status}${detail ? `: ${detail}` : ""}`,
    );
  }
  return (await res.json()) as T;
}

export const getDrivers = (season: Season) =>
  get<ApiDriver[]>(`/load/${season}/drivers`);
export const getTeams = (season: Season) =>
  get<ApiTeam[]>(`/load/${season}/teams`);
export const getRaces = (season: Season) =>
  get<ApiRace[]>(`/load/${season}/races`);
export const getResults = (season: Season) =>
  get<ApiResult[]>(`/load/${season}/results`);
export const getDriverStandings = (season: Season) =>
  get<ApiDriverStanding[]>(`/load/${season}/standings/drivers`);
export const getTeamStandings = (season: Season) =>
  get<ApiTeamStanding[]>(`/load/${season}/standings/teams`);
export const getPunishments = () =>
  get<ApiPunishment[]>(`/load/2026/punishments`);
export const getSuperLicense = () =>
  get<ApiSuperLicense[]>(`/load/2026/super-license`);
