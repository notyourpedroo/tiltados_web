// Identidade visual das equipes, deduzida pelo nome cadastrado na API
// (os team_id mudam entre temporadas, os nomes não).

interface TeamStyle {
  color: string;
  short: string;
}

// As cores ficam em variáveis CSS (globals.css) para cada tema ter seu tom.
// A ordem importa: "racing bulls" precisa vir antes de "red bull".
const TEAM_STYLES: [match: string, style: TeamStyle][] = [
  ["racing bulls", { color: "var(--team-racing-bulls)", short: "Racing Bulls" }],
  ["red bull", { color: "var(--team-red-bull)", short: "Red Bull" }],
  ["ferrari", { color: "var(--team-ferrari)", short: "Ferrari" }],
  ["mclaren", { color: "var(--team-mclaren)", short: "McLaren" }],
  ["mercedes", { color: "var(--team-mercedes)", short: "Mercedes" }],
  ["alpine", { color: "var(--team-alpine)", short: "Alpine" }],
  ["sauber", { color: "var(--team-sauber)", short: "Sauber" }],
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
