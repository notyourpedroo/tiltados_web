import { describe, expect, test } from "vitest";
import { result, season, session } from "./season-fixtures";
import { MINIMUM_SESSIONS_SHARE, seasonHighlights } from "./season-highlights";

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

    expect(seasonHighlights(data).winSequencia).toEqual({ value: 2, driverIds: [10, 20] });
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

  test("Melhor Ritmo só considera quem disputou ao menos metade das Sessões da temporada", () => {
    const races = [1, 2, 3, 4].map((id) => session(id, id));
    const data = season(
      [],
      ...races.map((r): [typeof r, ReturnType<typeof result>[]] => [
        r,
        [
          result(r, 10, FERRARI, 1, { bestLap: "1:30.000" }),
          result(r, 20, MCLAREN, 2, { bestLap: "1:30.900" }),
          // O 30 só corre a 1ª Sessão (menos da metade), e nela a volta mais rápida é dele.
          ...(r.id === 1 ? [result(r, 30, MCLAREN, 3, { bestLap: "1:29.000" })] : []),
          // O 40 corre exatamente metade das Sessões, meio segundo atrás do 10.
          ...(r.id <= 2 ? [result(r, 40, FERRARI, 4, { bestLap: "1:30.500" })] : []),
        ],
      ]),
    );

    // Na 1ª Sessão a referência é o 1:29.000 do 30; nas outras, o 1:30.000 do 10.
    const ten = (1 / 89 + 0 + 0 + 0) / 4;
    const forty = (1.5 / 89 + 0.5 / 90) / 2;
    expect(ten).toBeLessThan(forty);
    const { ritmo } = seasonHighlights(data);
    expect(ritmo?.driverIds).toEqual([10]);
    expect(ritmo?.value).toBeCloseTo(ten, 10);
  });

  test("Melhor Ritmo lista todos os empatados", () => {
    const race = session(1, 1);
    const race2 = session(2, 2);
    const data = season(
      [],
      [race, [result(race, 20, MCLAREN, 1, { bestLap: "1:30.000" }), result(race, 10, FERRARI, 2, { bestLap: "1:31.000" })]],
      [race2, [result(race2, 10, FERRARI, 1, { bestLap: "1:30.000" }), result(race2, 20, MCLAREN, 2, { bestLap: "1:31.000" })]],
    );

    const { ritmo } = seasonHighlights(data);
    expect(ritmo?.driverIds).toEqual([20, 10]);
    expect(ritmo?.value).toBeCloseTo(1 / 180, 10);
  });

  test("Melhor Aproveitamento só considera quem disputou ao menos metade das Sessões da temporada", () => {
    const sprint = session(1, 1, true);
    const race = session(2, 1);
    const race2 = session(3, 2);
    const race3 = session(4, 3);
    const data = season(
      [],
      // O 40 vence a única Sessão que disputa (25 pts por Sessão), mas fica abaixo do mínimo de 2.
      [sprint, [result(sprint, 10, FERRARI, 2), result(sprint, 20, MCLAREN, 3)]],
      [race, [result(race, 30, FERRARI, 1), result(race, 10, FERRARI, 2), result(race, 20, MCLAREN, 3)]],
      [race2, [result(race2, 30, FERRARI, 2), result(race2, 10, FERRARI, 3), result(race2, 20, MCLAREN, 4)]],
      [race3, [result(race3, 40, MCLAREN, 1), result(race3, 10, FERRARI, 2), result(race3, 20, MCLAREN, 3)]],
    );

    // O 30 disputa exatamente metade: (25 + 18) / 2 = 21,5 pts por Sessão.
    expect(seasonHighlights(data).performance).toEqual({ value: 21.5, driverIds: [30] });
  });

  test("Melhor Aproveitamento lista todos os empatados, na ordem em que aparecem na temporada", () => {
    const race = session(1, 1);
    const race2 = session(2, 2);
    const data = season(
      [],
      [race, [result(race, 20, MCLAREN, 1), result(race, 10, FERRARI, 2), result(race, 30, FERRARI, 3)]],
      [race2, [result(race2, 10, FERRARI, 1), result(race2, 20, MCLAREN, 2), result(race2, 30, FERRARI, 3)]],
    );

    expect(seasonHighlights(data).performance).toEqual({ value: 21.5, driverIds: [20, 10] });
  });

  // O corte sai da mesma constante que o texto do tooltip (indicators.test.ts confere o texto):
  // se o cálculo deixar de usá-la, mudar o corte quebra este teste.
  test("Melhor Ritmo e Melhor Aproveitamento cortam em MINIMUM_SESSIONS_SHARE das Sessões", () => {
    const played = 10;
    const needed = Math.ceil(played * MINIMUM_SESSIONS_SHARE);
    const races = Array.from({ length: played }, (_, i) => session(i + 1, i + 1));
    const data = season(
      [],
      ...races.map((r): [typeof r, ReturnType<typeof result>[]] => [
        r,
        [
          // O 30 é o melhor em tudo, mas disputa uma Sessão a menos que o corte.
          ...(r.id < needed ? [result(r, 30, MCLAREN, 1, { bestLap: "1:30.000" })] : []),
          // O 20 disputa exatamente o corte.
          ...(r.id <= needed ? [result(r, 20, MCLAREN, 2, { bestLap: "1:30.500" })] : []),
          result(r, 10, FERRARI, 3, { bestLap: "1:31.000" }),
        ],
      ]),
    );

    const { ritmo, performance } = seasonHighlights(data);
    expect(ritmo?.driverIds).toEqual([20]);
    expect(performance.driverIds).toEqual([20]);
  });

  test("Hat-tricks lista os líderes empatados; a Sprint perfeita não conta", () => {
    const sprint = session(1, 1, true);
    const race = session(2, 1);
    const race2 = session(3, 2);
    const perfect = { grid: 1, fastestLap: true };
    const data = season(
      [],
      [sprint, [result(sprint, 30, FERRARI, 1, perfect), result(sprint, 20, MCLAREN, 2)]],
      [race, [result(race, 20, MCLAREN, 1, perfect), result(race, 10, FERRARI, 2)]],
      [race2, [result(race2, 10, FERRARI, 1, perfect), result(race2, 20, MCLAREN, 2)]],
    );

    expect(seasonHighlights(data).hatTricks).toEqual({ value: 1, driverIds: [20, 10] });
  });

  test("Hat-tricks fica sem líder quando ninguém fez um", () => {
    const race = session(1, 1);
    const data = season([], [race, [result(race, 10, FERRARI, 1, { grid: 1 })]]);

    expect(seasonHighlights(data).hatTricks).toBeNull();
  });

  test("temporada sem Sessão disputada fica sem líderes, com valor zero, e sem Melhor Ritmo", () => {
    const none = { value: 0, driverIds: [] };

    expect(seasonHighlights(season([]))).toEqual({
      poles: none,
      fastestLaps: none,
      winSequencia: none,
      recentForm: [],
      ritmo: null,
      performance: none,
      hatTricks: null,
    });
  });
});
