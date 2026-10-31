// Identidade visual das equipes, deduzida pelo nome cadastrado na API
// (os team_id mudam entre temporadas, os nomes não).

export interface TeamLogo {
  /** Versão colorida, para o tema claro. */
  light: string;
  /** Versão branca, para o tema escuro. */
  dark: string;
}

interface TeamStyle {
  color: string;
  short: string;
  logo?: TeamLogo;
}

// Logos oficiais (media.formula1.com) em public/teams/: a colorida e a branca.
const logo = (slug: string): TeamLogo => ({
  light: `/teams/${slug}.webp`,
  dark: `/teams/${slug}-white.webp`,
});

// As cores ficam em variáveis CSS (globals.css) para cada tema ter seu tom.
// O slug nomeia os arquivos da equipe (logos e Carros).
// A ordem importa: "racing bulls" precisa vir antes de "red bull".
const TEAMS: [match: string, slug: string, style: TeamStyle][] = [
  ["racing bulls", "racing-bulls", { color: "var(--team-racing-bulls)", short: "Racing Bulls", logo: logo("racing-bulls") }],
  ["red bull", "red-bull", { color: "var(--team-red-bull)", short: "Red Bull", logo: logo("red-bull") }],
  ["ferrari", "ferrari", { color: "var(--team-ferrari)", short: "Ferrari", logo: logo("ferrari") }],
  ["mclaren", "mclaren", { color: "var(--team-mclaren)", short: "McLaren", logo: logo("mclaren") }],
  ["mercedes", "mercedes", { color: "var(--team-mercedes)", short: "Mercedes", logo: logo("mercedes") }],
  ["alpine", "alpine", { color: "var(--team-alpine)", short: "Alpine", logo: logo("alpine") }],
  // Kick Sauber: a versão branca vem da pasta de 2024 da CDN (a de 2025 é igual à colorida).
  ["sauber", "sauber", { color: "var(--team-sauber)", short: "Sauber", logo: logo("sauber") }],
  ["aston martin", "aston-martin", { color: "var(--team-aston-martin)", short: "Aston Martin" }],
  ["williams", "williams", { color: "var(--team-williams)", short: "Williams" }],
  ["haas", "haas", { color: "var(--team-haas)", short: "Haas" }],
];

const FALLBACK_COLOR = "var(--team-other)";

function findTeam(teamName: string) {
  const name = teamName.toLowerCase();
  return TEAMS.find(([match]) => name.includes(match));
}

export function teamStyle(teamName: string): TeamStyle {
  const hit = findTeam(teamName);
  return hit ? hit[2] : { color: FALLBACK_COLOR, short: teamName };
}

// Jogo de cada temporada e o ano dos Carros que ele traz. É registrado, não
// calculado: o mesmo Jogo pode receber mais de uma temporada.
const SEASON_GAMES: Record<string, { game: string; carYear: number }> = {
  "2025": { game: "F1 24", carYear: 2024 },
  "2026": { game: "F1 25", carYear: 2025 },
};

// Equipes com Carro em cada ano, pelo slug. As imagens (renderizações laterais
// da CDN da F1, em WebP com transparência) ficam em public/cars/<ano do Carro>/.
const CARS: Record<number, string[]> = {
  2024: ["red-bull", "ferrari", "alpine", "mclaren", "sauber"],
  2025: ["red-bull", "ferrari", "alpine", "mclaren", "sauber", "mercedes", "racing-bulls"],
};

/**
 * Endereço do Carro da equipe no Jogo da temporada, ou `undefined` quando a
 * temporada não tem Jogo registrado ou a equipe não está no Jogo. Nunca
 * devolve o Carro de outro ano.
 */
export function teamCar(teamName: string, season: string): string | undefined {
  const game = SEASON_GAMES[season];
  const slug = findTeam(teamName)?.[1];
  if (!game || !slug || !CARS[game.carYear]?.includes(slug)) return undefined;
  return `/cars/${game.carYear}/${slug}.webp`;
}
