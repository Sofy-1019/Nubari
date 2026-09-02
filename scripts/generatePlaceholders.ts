import fs from "fs";
import path from "path";

// Genera imágenes placeholder en SVG (sin dependencias externas ni red)
// para los productos de ejemplo. Estas NO son fotografías reales: apenas
// el cliente cargue sus propias fotos desde el admin, deben reemplazarse.

const OUT_DIR = path.join(process.cwd(), "public", "images", "products");
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const palette = ["#e9e2d3", "#d9cdb4", "#c9a878", "#a9713f", "#1a1817"];

function makePlaceholder(name: string, seedIndex: number): string {
  const bg = palette[seedIndex % 2 === 0 ? 0 : 1];
  const accent = palette[3];
  const lines = name.toUpperCase().match(/.{1,18}(\s|$)/g) || [name];
  const textEls = lines
    .map(
      (line, i) =>
        `<text x="50%" y="${52 + i * 6}%" text-anchor="middle" font-family="Georgia, serif" font-size="34" fill="${accent}" letter-spacing="2">${line.trim()}</text>`
    )
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 1100">
  <rect width="900" height="1100" fill="${bg}" />
  <rect x="40" y="40" width="820" height="1020" fill="none" stroke="${accent}" stroke-width="1.5" opacity="0.4"/>
  <circle cx="450" cy="330" r="120" fill="none" stroke="${accent}" stroke-width="1.5" opacity="0.5"/>
  ${textEls}
  <text x="50%" y="90%" text-anchor="middle" font-family="Georgia, serif" font-size="18" fill="${accent}" opacity="0.7" letter-spacing="6">NUBARI · IMAGEN DE MUESTRA</text>
</svg>`;
}

export function generatePlaceholder(slug: string, name: string, index: number) {
  const svg = makePlaceholder(name, index);
  const file = path.join(OUT_DIR, `${slug}.svg`);
  fs.writeFileSync(file, svg, "utf-8");
  return `/images/products/${slug}.svg`;
}
