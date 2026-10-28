import { describe, expect, test } from "vitest";
import { describeLicense } from "./license";

describe("Superlicença", () => {
  test("status pelos pontos restantes aparecem com rótulo, ícone e cor próprios", () => {
    expect(describeLicense("Regular")).toEqual({
      label: "Regular",
      icon: "✓",
      color: "var(--status-regular)",
    });
    expect(describeLicense("Atencao")).toEqual({
      label: "Atenção",
      icon: "!",
      color: "var(--status-atencao)",
    });
    expect(describeLicense("Alerta Critico")).toEqual({
      label: "Alerta crítico",
      icon: "‼",
      color: "var(--status-alerta)",
    });
  });

  test("piloto com Suspensão a cumprir aparece como Suspenso, em vermelho", () => {
    expect(describeLicense("Suspenso")).toEqual({
      label: "Suspenso",
      icon: "⛔",
      color: "var(--status-suspenso)",
    });
  });

  test.each(["Suspenso (Ban)", "Suspensao cumprida"])(
    "status que o site não conhece (%s) aparece neutro, com o texto da API, nunca como Regular",
    (status) => {
      expect(describeLicense(status)).toEqual({ label: status, icon: "?", color: "var(--muted)" });
    },
  );
});
