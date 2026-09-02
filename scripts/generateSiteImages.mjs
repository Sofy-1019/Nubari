import fs from "fs";
import path from "path";

function svg(bg, accent, label, w = 1600, h = 1000) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">
  <rect width="${w}" height="${h}" fill="${bg}"/>
  <rect x="24" y="24" width="${w - 48}" height="${h - 48}" fill="none" stroke="${accent}" stroke-width="1" opacity="0.35"/>
  <text x="50%" y="50%" text-anchor="middle" font-family="Georgia, serif" font-size="${Math.min(w, h) / 16}" fill="${accent}" letter-spacing="3" opacity="0.85">${label}</text>
</svg>`;
}

const items = [
  ["public/images/hero.svg", "#1a1817", "#c99a6c", "NUBARI · IMAGEN AMBIENTADA", 1920, 1200],
  ["public/images/categories/banquetas.svg", "#e9e2d3", "#a9713f", "BANQUETAS", 900, 900],
  ["public/images/categories/organizacion.svg", "#d9cdb4", "#a9713f", "ORGANIZACIÓN", 900, 900],
  ["public/images/categories/cocina.svg", "#e9e2d3", "#a9713f", "COCINA", 900, 900],
  ["public/images/categories/hogar.svg", "#d9cdb4", "#a9713f", "HOGAR", 900, 900],
  ["public/images/categories/oficina.svg", "#e9e2d3", "#a9713f", "OFICINA", 900, 900],
  ["public/images/categories/novedades.svg", "#1a1817", "#c99a6c", "NOVEDADES", 900, 900],
  ["public/images/ambientes/living.svg", "#d9cdb4", "#a9713f", "LIVING", 900, 900],
  ["public/images/ambientes/dormitorio.svg", "#e9e2d3", "#a9713f", "DORMITORIO", 900, 900],
  ["public/images/ambientes/cocina.svg", "#1a1817", "#c99a6c", "COCINA NUBARI", 1200, 1500],
];

for (const [file, bg, accent, label, w, h] of items) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, svg(bg, accent, label, w, h));
}
console.log("OK", items.length, "imágenes de sitio generadas");
