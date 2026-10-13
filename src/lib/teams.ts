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
// A ordem importa: "racing bulls" precisa vir antes de "red bull".
const TEAM_STYLES: [match: string, style: TeamStyle][] = [
  ["racing bulls", { color: "var(--team-racing-bulls)", short: "Racing Bulls", logo: logo("racing-bulls") }],
  ["red bull", { color: "var(--team-red-bull)", short: "Red Bull", logo: logo("red-bull") }],
  ["ferrari", { color: "var(--team-ferrari)", short: "Ferrari", logo: logo("ferrari") }],
  ["mclaren", { color: "var(--team-mclaren)", short: "McLaren", logo: logo("mclaren") }],
  ["mercedes", { color: "var(--team-mercedes)", short: "Mercedes", logo: logo("mercedes") }],
  ["alpine", { color: "var(--team-alpine)", short: "Alpine", logo: logo("alpine") }],
  // Kick Sauber: a versão branca vem da pasta de 2024 da CDN (a de 2025 é igual à colorida).
  ["sauber", { color: "var(--team-sauber)", short: "Sauber", logo: logo("sauber") }],
  ["aston martin", { color: "var(--team-aston-martin)", short: "Aston Martin" }],
  ["williams", { color: "var(--team-williams)", short: "Williams" }],
  ["haas", { color: "var(--team-haas)", short: "Haas" }],
];

const FALLBACK_COLOR = "var(--team-other)";

export function teamStyle(teamName: string): TeamStyle {
  const name = teamName.toLowerCase();
  const hit = TEAM_STYLES.find(([match]) => name.includes(match));
  return hit ? hit[1] : { color: FALLBACK_COLOR, short: teamName };
}
