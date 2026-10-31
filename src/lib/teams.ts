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

// O slug nomeia a variável de cor da equipe (globals.css, um tom por tema) e os
// arquivos dela (logos e Carros).
// A ordem importa: "racing bulls" precisa vir antes de "red bull".
const TEAM_ROWS: [match: string, slug: string, short: string, hasLogo: boolean][] = [
  ["racing bulls", "racing-bulls", "Racing Bulls", true],
  ["red bull", "red-bull", "Red Bull", true],
  ["ferrari", "ferrari", "Ferrari", true],
  ["mclaren", "mclaren", "McLaren", true],
  ["mercedes", "mercedes", "Mercedes", true],
  ["alpine", "alpine", "Alpine", true],
  // Kick Sauber: a versão branca vem da pasta de 2024 da CDN (a de 2025 é igual à colorida).
  ["sauber", "sauber", "Sauber", true],
  ["aston martin", "aston-martin", "Aston Martin", false],
  ["williams", "williams", "Williams", false],
  ["haas", "haas", "Haas", false],
];

const TEAMS = TEAM_ROWS.map(([match, slug, short, hasLogo]) => {
  const style: TeamStyle = { color: `var(--team-${slug})`, short };
  if (hasLogo) style.logo = logo(slug);
  return { match, slug, style };
});

const FALLBACK_COLOR = "var(--team-other)";

function findTeam(teamName: string) {
  const name = teamName.toLowerCase();
  return TEAMS.find(({ match }) => name.includes(match));
}

export function teamStyle(teamName: string): TeamStyle {
  return findTeam(teamName)?.style ?? { color: FALLBACK_COLOR, short: teamName };
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
  const slug = findTeam(teamName)?.slug;
  if (!game || !slug || !CARS[game.carYear]?.includes(slug)) return undefined;
  return `/cars/${game.carYear}/${slug}.webp`;
}
