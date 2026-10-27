import { describe, expect, test } from "vitest";
import { describeChance, describeTitleRace } from "./chance";
import type { TitleStatus } from "./types";

describe("Chance de título", () => {
  test("mostra a chance no padrão brasileiro", () => {
    const view = describeChance({ status: "Na disputa", championship_probability: 87.3 }, "driver");
    expect(view.text).toBe("87,3%");
  });

  test("quem está Na disputa com 0 aparece como menos de 0,1%", () => {
    const view = describeChance({ status: "Na disputa", championship_probability: 0 }, "driver");
    expect(view.text).toBe("< 0,1%");
  });

  test("quem está Na disputa com 100 aparece como mais de 99,9%", () => {
    const view = describeChance({ status: "Na disputa", championship_probability: 100 }, "driver");
    expect(view.text).toBe("> 99,9%");
  });

  test("Eliminado com 0 e Campeão com 100 aparecem sem aproximação", () => {
    expect(describeChance({ status: "Eliminado", championship_probability: 0 }, "driver").text).toBe("0%");
    expect(describeChance({ status: "Campeao", championship_probability: 100 }, "driver").text).toBe("100%");
  });

  test("mostra a casa decimal só quando ela existe", () => {
    expect(describeChance({ status: "Na disputa", championship_probability: 12 }, "driver").text).toBe("12%");
    expect(describeChance({ status: "Na disputa", championship_probability: 0.4 }, "driver").text).toBe("0,4%");
  });

  test("piloto Eliminado ganha o selo Eliminado e a linha esmaecida", () => {
    const view = describeChance({ status: "Eliminado", championship_probability: 0 }, "driver");
    expect(view.badge).toEqual({ label: "Eliminado", tone: "eliminated" });
    expect(view.dimmed).toBe(true);
  });

  test("piloto Na disputa e Campeão ganham os seus selos, sem esmaecer", () => {
    const contention = describeChance({ status: "Na disputa", championship_probability: 40 }, "driver");
    expect(contention.badge).toEqual({ label: "Na disputa", tone: "contention" });
    expect(contention.dimmed).toBe(false);

    const champion = describeChance({ status: "Campeao", championship_probability: 100 }, "driver");
    expect(champion.badge).toEqual({ label: "Campeão", tone: "champion" });
    expect(champion.dimmed).toBe(false);
  });

  test("equipe Campeã ganha o selo no feminino", () => {
    const view = describeChance({ status: "Campeao", championship_probability: 100 }, "team");
    expect(view.badge).toEqual({ label: "Campeã", tone: "champion" });
  });

  test("equipe Na disputa ganha o selo Na disputa, sem esmaecer", () => {
    const view = describeChance({ status: "Na disputa", championship_probability: 55.5 }, "team");
    expect(view.badge).toEqual({ label: "Na disputa", tone: "contention" });
    expect(view.dimmed).toBe(false);
  });

  test("equipe Eliminada ganha o selo no feminino e a linha esmaecida", () => {
    const view = describeChance({ status: "Eliminado", championship_probability: 0 }, "team");
    expect(view.badge).toEqual({ label: "Eliminada", tone: "eliminated" });
    expect(view.dimmed).toBe(true);
  });

  test("a barra ocupa a porcentagem da Chance de título", () => {
    expect(describeChance({ status: "Na disputa", championship_probability: 62.5 }, "driver").bar).toBe(62.5);
  });
});

describe("Disputa pelo título", () => {
  const row = (driver_id: number, status: TitleStatus, championship_probability: number) => ({
    driver_id,
    status,
    championship_probability,
  });

  test("mantém a ordem que a API devolve", () => {
    const race = describeTitleRace(
      [row(7, "Na disputa", 30), row(3, "Na disputa", 70), row(5, "Eliminado", 0)],
      "driver",
    );
    expect(race.rows.map((r) => r.driver_id)).toEqual([7, 3, 5]);
    expect(race.rows[1].view.text).toBe("70%");
  });

  test("lista vazia não tem linhas", () => {
    expect(describeTitleRace([], "driver").rows).toEqual([]);
  });
});
