import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type {
  ApiDriver,
  ApiDriverPrediction,
  ApiDriverStanding,
  ApiPunishment,
  ApiRace,
  ApiResult,
  ApiSuperLicense,
  ApiTeam,
  ApiTeamPrediction,
  ApiTeamStanding,
  Season,
} from "./types";

// A API é sempre consultada pelo servidor do Next (nunca pelo navegador): em
// produção, direto em http://127.0.0.1:8000; no build do GitHub Actions, que roda
// fora do servidor, por HTTPS através do nginx em /api.
// O endereço não fica no código: vem de TILTADOS_API_URL (.env.local no dev,
// Secret DEPLOY_HOST no GitHub Actions, unit do systemd em produção).
const API_URL = process.env.TILTADOS_API_URL?.replace(/\/+$/, "");
if (!API_URL) {
  throw new Error(
    "TILTADOS_API_URL não definida. Copie .env.example para .env.local e preencha o endereço da API.",
  );
}

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
export const getDriverPrediction = () =>
  get<ApiDriverPrediction[]>(`/load/2026/prediction/drivers`);
export const getTeamPrediction = () =>
  get<ApiTeamPrediction[]>(`/load/2026/prediction/teams`);
