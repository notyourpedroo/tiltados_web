import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, test } from "vitest";
import { teamCar } from "./teams";

// Nomes como cadastrados na API (files/2025/teams.csv e files/teams.csv).
const TEAMS_2025 = [
  "Oracle Red Bull Racing",
  "Scuderia Ferrari HP",
  "BWT Alpine F1 Team",
  "McLaren F1 Team",
  "Stake F1 Team Kick Sauber",
];
const TEAMS_2026 = [
  "Red Bull",
  "Scuderia Ferrari HP",
  "BWT Alpine F1 Team",
  "McLaren F1 Team",
  "Stake F1 Team Kick Sauber",
  "Mercedes-AMG Petronas",
  "Visa Cash App Racing Bulls",
];

describe("Carro da equipe", () => {
  test("em 2025 (F1 24) a equipe recebe o Carro de 2024", () => {
    expect(teamCar("Oracle Red Bull Racing", "2025")).toBe("/cars/2024/red-bull.webp");
    expect(teamCar("Stake F1 Team Kick Sauber", "2025")).toBe("/cars/2024/sauber.webp");
  });

  test("em 2026 (F1 25) a equipe recebe o Carro de 2025", () => {
    expect(teamCar("Red Bull", "2026")).toBe("/cars/2025/red-bull.webp");
    expect(teamCar("Visa Cash App Racing Bulls", "2026")).toBe("/cars/2025/racing-bulls.webp");
  });

  test("equipe com nome desconhecido não tem Carro", () => {
    expect(teamCar("Cadillac F1 Team", "2026")).toBeUndefined();
  });

  test("temporada sem Jogo registrado não dá Carro a nenhuma equipe", () => {
    for (const team of TEAMS_2026) expect(teamCar(team, "2027")).toBeUndefined();
  });

  test("equipe que não está no Jogo da temporada não ganha o Carro de outro ano", () => {
    expect(teamCar("Mercedes-AMG Petronas", "2025")).toBeUndefined();
  });

  test.each([
    ["2025", TEAMS_2025],
    ["2026", TEAMS_2026],
  ])("todo Carro das equipes cadastradas em %s aponta para um arquivo do site", (season, teams) => {
    for (const team of teams) {
      const car = teamCar(team, season);
      expect(car, team).toBeDefined();
      expect(existsSync(fileURLToPath(new URL(`../../public${car}`, import.meta.url))), car).toBe(true);
    }
  });
});
