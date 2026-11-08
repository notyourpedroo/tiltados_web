import { describe, expect, test } from "vitest";
import { buildSessions } from "./sessions";
import type { ApiRace, ApiResult } from "./types";

// Montagem dos resultados a partir de linhas cruas da API montadas à mão.

const RACE: ApiRace = {
  race_id: 1,
  race_name: "GP DA BÉLGICA",
  race_date: "2025-08-10",
  race_location: "Spa",
  is_sprint: false,
};

/** Linha crua de resultado; o tempo padrão é uma volta válida. */
function row(driverId: number, grid: number, position: number, lap = "1:45.000"): ApiResult {
  return {
    race_id: RACE.race_id,
    driver_id: driverId,
    team_id: 1,
    driver_start_position: grid,
    driver_final_position: position,
    grid_result: grid,
    driver_fastest_lap: lap,
  };
}

describe("buildSessions", () => {
  test("o abandono (largou P7, chegou P10 com 9:99.999) fica na Classificação com as posições perdidas", () => {
    const rows = [
      row(7, 7, 10, "9:99.999"),
      row(1, 1, 1),
      row(2, 2, 2),
      row(3, 3, 3),
      row(4, 4, 4),
      row(5, 5, 5),
      row(6, 6, 6),
      row(8, 8, 7),
      row(9, 9, 8),
      row(10, 10, 9),
    ];
    const results = buildSessions([RACE], rows).results[RACE.race_id];
    expect(results.map((r) => r.position)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(results.at(-1)).toMatchObject({ driverId: 7, position: 10, grid: 7, gained: -3 });
  });

  test("a Volta mais rápida fica com o melhor tempo válido", () => {
    const rows = [
      row(1, 1, 1, "1:45.500"),
      row(10, 10, 10, "9:99.999"),
      row(2, 2, 2, "1:44.900"),
      ...Array.from({ length: 7 }, (_, i) => row(i + 3, i + 3, i + 3, "1:46.000")),
    ];
    const results = buildSessions([RACE], rows).results[RACE.race_id];
    expect(results.filter((r) => r.fastestLap).map((r) => r.driverId)).toEqual([2]);
  });
});
