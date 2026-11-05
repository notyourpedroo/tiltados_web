import { describe, expect, test } from "vitest";
import { lapToMs } from "./lap";

describe("Tempo de volta", () => {
  test("lê minutos e segundos com milésimos", () => {
    expect(lapToMs("1:30.123")).toBe(90123);
  });

  test("lê só segundos", () => {
    expect(lapToMs("90.123")).toBe(90123);
  });

  test("recusa o tempo de quem não marcou volta (\"9:99.999\", da API de 2025)", () => {
    expect(lapToMs("9:99.999")).toBeNull();
  });

  test("recusa texto que não é tempo", () => {
    expect(lapToMs("")).toBeNull();
    expect(lapToMs("-")).toBeNull();
  });
});
