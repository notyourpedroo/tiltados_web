import { describe, expect, test } from "vitest";
import type { Session } from "./season";
import { weekends } from "./weekend";

function session(id: number, round: number, isSprint: boolean): Session {
  return {
    id,
    name: isSprint ? "GP de Teste (SPRINT)" : "GP de Teste",
    gpName: "GP de Teste",
    date: "2026-10-26",
    location: "Autódromo",
    isSprint,
    round,
  };
}

describe("Etapas", () => {
  test("Etapa com Sprint e Corrida registradas traz as duas Sessões", () => {
    const sprint = session(10, 1, true);
    const race = session(11, 1, false);

    expect(weekends([sprint, race])).toEqual([{ round: 1, race, sprint }]);
  });

  test("Etapa só com a Sprint registrada fica sem Corrida, depois das Etapas anteriores", () => {
    const race1 = session(1, 1, false);
    const sprint2 = session(2, 2, true);

    const [first, second] = weekends([race1, sprint2]);

    expect(first).toEqual({ round: 1, race: race1 });
    expect(second.round).toBe(2);
    expect(second.race).toBeUndefined();
    expect(second.sprint).toBe(sprint2);
  });
});
