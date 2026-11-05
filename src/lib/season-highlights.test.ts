import { describe, expect, test } from "vitest";
import { result, season, session } from "./season-fixtures";
import { seasonHighlights } from "./season-highlights";

const FERRARI = 1;
const MCLAREN = 2;

describe("Destaques da temporada", () => {
  test("Mais poles conta só largadas em 1º em Corridas: a pole da Sprint não desempata", () => {
    const sprint = session(1, 1, true);
    const race = session(2, 1);
    const race2 = session(3, 2);
    const data = season(
      [],
      [sprint, [result(sprint, 10, FERRARI, 1, { grid: 1 }), result(sprint, 20, MCLAREN, 2, { grid: 2 })]],
      [race, [result(race, 20, MCLAREN, 1, { grid: 2 }), result(race, 10, FERRARI, 2, { grid: 1 })]],
      [race2, [result(race2, 20, MCLAREN, 1, { grid: 1 }), result(race2, 10, FERRARI, 2, { grid: 2 })]],
    );

    expect(seasonHighlights(data).poles).toEqual({ value: 1, driverIds: [10, 20] });
  });

  test("Mais voltas rápidas lista todos os empatados, na ordem em que aparecem na temporada", () => {
    const sprint = session(1, 1, true);
    const race = session(2, 1);
    const race2 = session(3, 2);
    const race3 = session(4, 3);
    const race4 = session(5, 4);
    const data = season(
      [],
      // O 30 aparece primeiro, mas só faz uma Volta mais rápida.
      [sprint, [result(sprint, 30, FERRARI, 1, { fastestLap: true }), result(sprint, 20, MCLAREN, 2)]],
      [race, [result(race, 20, MCLAREN, 1, { fastestLap: true }), result(race, 10, FERRARI, 2)]],
      [race2, [result(race2, 10, FERRARI, 1, { fastestLap: true }), result(race2, 20, MCLAREN, 2)]],
      [race3, [result(race3, 10, FERRARI, 1), result(race3, 20, MCLAREN, 2, { fastestLap: true })]],
      [race4, [result(race4, 20, MCLAREN, 1), result(race4, 10, FERRARI, 2, { fastestLap: true })]],
    );

    expect(seasonHighlights(data).fastestLaps).toEqual({ value: 2, driverIds: [20, 10] });
  });

  test("Maior Sequência de vitórias lista todos os empatados na maior da temporada", () => {
    const race = session(1, 1);
    const race2 = session(2, 2);
    const race3 = session(3, 3);
    const race4 = session(4, 4);
    const data = season(
      [],
      [race, [result(race, 10, FERRARI, 1), result(race, 20, MCLAREN, 2)]],
      [race2, [result(race2, 10, FERRARI, 1), result(race2, 20, MCLAREN, 2)]],
      [race3, [result(race3, 20, MCLAREN, 1), result(race3, 10, FERRARI, 2)]],
      [race4, [result(race4, 20, MCLAREN, 1), result(race4, 10, FERRARI, 2)]],
    );

    expect(seasonHighlights(data).winStreak).toEqual({ value: 2, driverIds: [10, 20] });
  });

  test("Forma recente traz os 3 pilotos com mais pontos nas últimas 3 Etapas, empatados na ordem em que aparecem", () => {
    const r1 = session(1, 1);
    const sprint2 = session(2, 2, true);
    const r2 = session(3, 2);
    const r3 = session(4, 3);
    const r4 = session(5, 4);
    const data = season(
      [],
      // Etapa 1 fica fora da janela: o 40 venceu, mas não pontua mais.
      [r1, [result(r1, 40, MCLAREN, 1), result(r1, 30, MCLAREN, 2)]],
      [sprint2, [result(sprint2, 10, FERRARI, 1), result(sprint2, 20, MCLAREN, 2)]],
      [r2, [result(r2, 20, MCLAREN, 1), result(r2, 10, FERRARI, 2)]],
      // O 30 empata com o 50 e aparece antes dele; o 50 fica fora do top 3.
      [r3, [result(r3, 30, MCLAREN, 2), result(r3, 50, FERRARI, 2)]],
      [r4, [result(r4, 40, MCLAREN, 7)]],
    );

    expect(seasonHighlights(data).recentForm).toEqual([
      { driverId: 20, points: 7 + 25 },
      { driverId: 10, points: 8 + 18 },
      { driverId: 30, points: 18 },
    ]);
  });

  test("temporada sem Sessão disputada fica sem líderes, com valor zero", () => {
    const none = { value: 0, driverIds: [] };

    expect(seasonHighlights(season([]))).toEqual({ poles: none, fastestLaps: none, winStreak: none, recentForm: [] });
  });
});
