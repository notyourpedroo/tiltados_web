import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { driverProfile } from "./driver-season";
import { seasonHighlights } from "./season-highlights";
import { buildSessions } from "./sessions";
import { teamProfile } from "./team-season";
import type { ApiRace, ApiResult } from "./types";

// Sanidade das contas sobre os dados reais da API (retratos de scripts/retrato-api.mjs).
// As fixtures montadas à mão só têm os casos que alguém lembrou; aqui entram os que a
// API manda de verdade, como o "9:99.999" de quem não marcou volta em 2025.

function realSeason(season: string) {
  const path = join(__dirname, `../../scripts/fixtures/retrato-${season}.json`);
  const fixture = JSON.parse(readFileSync(path, "utf8"));
  const races: ApiRace[] = fixture[`/load/${season}/races`];
  const results: ApiResult[] = fixture[`/load/${season}/results`];
  return { ...buildSessions(races, results), drivers: {} };
}

/** Caminhos dentro do objeto com número que não é finito (NaN, Infinity). */
function nonFinite(value: unknown, path = ""): string[] {
  if (typeof value === "number") return Number.isFinite(value) ? [] : [path];
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([k, v]) => nonFinite(v, `${path}.${k}`));
  }
  return [];
}

describe.each(["2025", "2026"])("temporada real de %s", (season) => {
  const data = realSeason(season);
  const played = data.sessions.filter((s) => data.results[s.id].length > 0);
  const races = played.filter((s) => !s.isSprint).length;
  const driverIds = [...new Set(played.flatMap((s) => data.results[s.id].map((r) => r.driverId)))];
  const teamIds = [...new Set(played.flatMap((s) => data.results[s.id].map((r) => r.teamId)))];

  test("cada Sessão disputada tem uma só Volta mais rápida", () => {
    for (const s of played) {
      expect(data.results[s.id].filter((r) => r.fastestLap), `Sessão ${s.id}`).toHaveLength(1);
    }
  });

  test.each(driverIds)("piloto %i tem números plausíveis", (driverId) => {
    const { stats, sequencias, performance } = driverProfile(data, driverId);
    expect(nonFinite(driverProfile(data, driverId))).toEqual([]);
    if (stats.ritmo !== null) {
      expect(stats.ritmo).toBeGreaterThanOrEqual(0);
      expect(stats.ritmo).toBeLessThan(0.2);
    }
    expect(stats.poleConversion.converted).toBeLessThanOrEqual(stats.poleConversion.poles);
    expect(stats.hatTricks).toBeLessThanOrEqual(stats.poles);
    for (const seq of Object.values(sequencias)) {
      expect(seq.current).toBeLessThanOrEqual(seq.best);
      expect(seq.best).toBeLessThanOrEqual(races);
    }
    if (performance) {
      expect(performance.scoringRate).toBeGreaterThanOrEqual(0);
      expect(performance.scoringRate).toBeLessThanOrEqual(1);
      expect(performance.pointsPerSession).toBeLessThanOrEqual(25);
    }
  });

  test.each(teamIds)("equipe %i tem números plausíveis", (teamId) => {
    const profile = teamProfile(data, teamId);
    expect(nonFinite(profile)).toEqual([]);
    if (profile.pointsPerSession !== null) expect(profile.pointsPerSession).toBeLessThanOrEqual(25);
  });

  test("os destaques da home são números plausíveis", () => {
    const highlights = seasonHighlights(data);
    expect(nonFinite(highlights)).toEqual([]);
    if (highlights.ritmo) expect(highlights.ritmo.value).toBeLessThan(0.2);
  });
});
