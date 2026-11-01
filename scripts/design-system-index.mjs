// Monta as seções de fichas do design-system/index.html a partir do comentário
// <!-- @dsCard group="..." height=N --> da primeira linha de cada prévia.
//
//   npm run ds:index
//
// Só o trecho entre os marcadores FICHAS_INICIO e FICHAS_FIM é reescrito; o resto do
// index.html (cabeçalho, estilos, script) continua sendo editado à mão. O
// design-system/components.test.ts confere que o arquivo commitado está igual ao gerado.
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const FICHAS_INICIO = "<!-- fichas: gerado por scripts/design-system-index.mjs (npm run ds:index) -->";
export const FICHAS_FIM = "<!-- /fichas -->";

// Ordem das seções. A prévia sem grupo é a capa.
const GROUPS = ["Capa", "Estrutura", "Dados", "Classificação", "Gráficos", "Padrões de página"];

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const componentsDir = join(root, "design-system/components");
const indexPath = join(root, "design-system/index.html");

/** Grupo, altura e se há guia de cada ficha, lidos da pasta de componentes. */
export function readFichas() {
  return readdirSync(componentsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map(({ name }) => {
      const dir = join(componentsDir, name);
      const files = readdirSync(dir);
      if (!files.includes("preview.html")) throw new Error(`${name}/ sem preview.html`);
      const firstLine = readFileSync(join(dir, "preview.html"), "utf8").split("\n", 1)[0];
      const meta = firstLine.match(/^<!-- @dsCard(?: group="([^"]+)")? height=(\d+) -->/);
      if (!meta) throw new Error(`${name}/preview.html sem o comentário @dsCard na primeira linha`);
      const group = meta[1] ?? "Capa";
      if (!GROUPS.includes(group)) throw new Error(`${name}: grupo desconhecido "${group}"`);
      return { name, group, height: Number(meta[2]), guide: files.includes("README.md") };
    });
}

/** As seções de fichas, uma ficha por linha, em ordem de grupo e de nome. */
export function fichasHtml(fichas = readFichas()) {
  const lines = [];
  for (const group of GROUPS) {
    const inGroup = fichas.filter((f) => f.group === group).sort((a, b) => (a.name < b.name ? -1 : 1));
    if (inGroup.length === 0) continue;
    lines.push(`<section><h2>${group}</h2>`);
    for (const { name, height, guide } of inGroup) {
      // A capa não é componente: a legenda é o nome da seção. Ficha sem guia mostra só o nome.
      const label = group === "Capa" ? group : name;
      const caption = guide ? `${label} <a href="components/${name}/README.md">guia</a>` : label;
      lines.push(
        `<figure><figcaption>${caption}</figcaption><iframe title="${name}" data-src="components/${name}/preview.html" style="height:${height}px" loading="lazy"></iframe></figure>`,
      );
    }
    lines.push("</section>");
  }
  return lines.join("\n");
}

/**
 * O index.html com o trecho entre os marcadores trocado pelas seções geradas, no mesmo
 * fim de linha do arquivo (no Windows o checkout traz CRLF).
 */
export function buildIndex(html, fichas) {
  const start = html.indexOf(FICHAS_INICIO);
  const end = html.indexOf(FICHAS_FIM);
  if (start < 0 || end < start) throw new Error("index.html sem os marcadores das fichas");
  const eol = html.includes("\r\n") ? "\r\n" : "\n";
  const body = fichasHtml(fichas).replaceAll("\n", eol);
  return `${html.slice(0, start + FICHAS_INICIO.length)}${eol}${body}${eol}${html.slice(end)}`;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  writeFileSync(indexPath, buildIndex(readFileSync(indexPath, "utf8")));
  console.log("design-system/index.html atualizado.");
}
