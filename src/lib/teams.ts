// Identidade visual das equipes, deduzida pelo nome cadastrado na API
// (os team_id mudam entre temporadas, os nomes não).

interface TeamStyle {
  color: string;
  short: string;
}

// A ordem importa: "racing bulls" precisa vir antes de "red bull".
const TEAM_STYLES: [match: string, style: TeamStyle][] = [
  ["racing bulls", { color: "#6692ff", short: "Racing Bulls" }],
  ["red bull", { color: "#3671c6", short: "Red Bull" }],
  ["ferrari", { color: "#e8002d", short: "Ferrari" }],
  ["mclaren", { color: "#ff8000", short: "McLaren" }],
  ["mercedes", { color: "#27f4d2", short: "Mercedes" }],
  ["alpine", { color: "#0093cc", short: "Alpine" }],
  ["sauber", { color: "#52e252", short: "Sauber" }],
  ["aston martin", { color: "#229971", short: "Aston Martin" }],
  ["williams", { color: "#64c4ff", short: "Williams" }],
  ["haas", { color: "#b6babd", short: "Haas" }],
];

const FALLBACK_COLOR = "#8a8a99";

export function teamStyle(teamName: string): TeamStyle {
  const name = teamName.toLowerCase();
  const hit = TEAM_STYLES.find(([match]) => name.includes(match));
  return hit ? hit[1] : { color: FALLBACK_COLOR, short: teamName };
}
