import fs from "fs";
import path from "path";
import { nanoid } from "nanoid";
import { slugify } from "../src/lib/utils";
import type { Product } from "../src/lib/types";
import { generatePlaceholder } from "./generatePlaceholders";

// ==========================================================================
// Carga productos de EJEMPLO para poder probar la tienda de punta a punta.
// Todos quedan marcados con esProductoDePrueba: true y con imágenes
// placeholder — deben reemplazarse por productos y fotos reales desde el
// panel administrador (/admin/productos) antes de salir a producción.
// ==========================================================================

interface SeedInput {
  nombre: string;
  categoria: Product["categoria"];
  descripcion: string;
  precio: number;
  precioAnterior?: number;
  destacado?: boolean;
  nuevo?: boolean;
  variantes: { color?: string; material?: string; medida?: string; stock: number }[];
  logistica: Product["logistica"];
}

const seeds: SeedInput[] = [
  {
    nombre: "Banqueta Nubari Tapizada",
    categoria: "banquetas",
    descripcion:
      "Banqueta de estructura metálica y asiento tapizado, pensada para living, dormitorio o escritorio. Líneas simples y materiales cálidos.",
    precio: 89900,
    precioAnterior: 104900,
    destacado: true,
    nuevo: false,
    variantes: [
      { color: "Beige", material: "Metal + tela", stock: 8 },
      { color: "Negro", material: "Metal + tela", stock: 5 },
    ],
    logistica: {
      pesoKg: 6.5,
      altoCm: 45,
      anchoCm: 38,
      largoCm: 38,
      bultos: 1,
      valorDeclarado: 89900,
      transportistasPermitidos: ["andreani", "via-cargo"],
    },
  },
  {
    nombre: "Banqueta Nubari Capitoné",
    categoria: "banquetas",
    descripcion:
      "Banqueta capitoné con terminación premium y base de madera natural. Una pieza de diseño para espacios que buscan calidez y carácter.",
    precio: 118500,
    destacado: true,
    nuevo: true,
    variantes: [
      { color: "Beige", material: "Madera + tela capitoné", stock: 4 },
      { color: "Gris", material: "Madera + tela capitoné", stock: 3 },
    ],
    logistica: {
      pesoKg: 8.2,
      altoCm: 46,
      anchoCm: 42,
      largoCm: 42,
      bultos: 1,
      valorDeclarado: 118500,
      transportistasPermitidos: ["andreani", "via-cargo"],
    },
  },
  {
    nombre: "Banco Nubari Lisa",
    categoria: "banquetas",
    descripcion:
      "Banco bajo de líneas rectas, ideal como apoyo auxiliar o para ambientar la entrada del hogar.",
    precio: 64900,
    destacado: false,
    nuevo: false,
    variantes: [{ color: "Madera natural", material: "Madera maciza", stock: 10 }],
    logistica: {
      pesoKg: 5.1,
      altoCm: 40,
      anchoCm: 35,
      largoCm: 35,
      bultos: 1,
      valorDeclarado: 64900,
      transportistasPermitidos: ["andreani", "via-cargo"],
    },
  },
  {
    nombre: "Organizador de Cocina Modular",
    categoria: "cocina",
    descripcion:
      "Sistema de organización modular para alacena o mesada. Compartimentos ajustables para optimizar cada centímetro.",
    precio: 34900,
    destacado: true,
    nuevo: false,
    variantes: [{ color: "Blanco", material: "Metal + madera", stock: 20 }],
    logistica: {
      pesoKg: 2.1,
      altoCm: 18,
      anchoCm: 30,
      largoCm: 40,
      bultos: 1,
      valorDeclarado: 34900,
      transportistasPermitidos: ["andreani", "via-cargo"],
    },
  },
  {
    nombre: "Organizador para Microondas",
    categoria: "cocina",
    descripcion:
      "Repisa elevadora para microondas u horno eléctrico, con espacio inferior para utensilios. Libera espacio en la mesada.",
    precio: 41900,
    destacado: false,
    nuevo: true,
    variantes: [
      { color: "Blanco", material: "Metal", stock: 12 },
      { color: "Negro", material: "Metal", stock: 9 },
    ],
    logistica: {
      pesoKg: 3.4,
      altoCm: 20,
      anchoCm: 40,
      largoCm: 45,
      bultos: 1,
      valorDeclarado: 41900,
      transportistasPermitidos: ["andreani", "via-cargo"],
    },
  },
  {
    nombre: "Mueble Auxiliar Nubari",
    categoria: "hogar",
    descripcion:
      "Mesa auxiliar de hierro y madera, versátil para living, dormitorio o como mesa de apoyo junto al sillón.",
    precio: 76900,
    destacado: true,
    nuevo: false,
    variantes: [{ color: "Negro + madera natural", material: "Hierro + madera", stock: 7 }],
    logistica: {
      pesoKg: 7.8,
      altoCm: 55,
      anchoCm: 40,
      largoCm: 40,
      bultos: 1,
      valorDeclarado: 76900,
      transportistasPermitidos: ["andreani", "via-cargo"],
    },
  },
  {
    nombre: "Organizador de Escritorio Nubari",
    categoria: "oficina",
    descripcion:
      "Set organizador para escritorio con divisiones para útiles, documentos y accesorios. Diseño minimalista en madera y metal.",
    precio: 28900,
    destacado: false,
    nuevo: false,
    variantes: [{ color: "Madera natural", material: "Madera + metal", stock: 15 }],
    logistica: {
      pesoKg: 1.6,
      altoCm: 15,
      anchoCm: 25,
      largoCm: 30,
      bultos: 1,
      valorDeclarado: 28900,
      transportistasPermitidos: ["andreani", "via-cargo"],
    },
  },
  {
    nombre: "Estantería Nubari Modular",
    categoria: "hogar",
    descripcion:
      "Estantería de hierro y madera de gran formato, pensada como pieza central de living o escritorio amplio. Por sus dimensiones, se cotiza especialmente.",
    precio: 189900,
    destacado: false,
    nuevo: true,
    variantes: [{ color: "Negro + madera natural", material: "Hierro + madera", stock: 3 }],
    logistica: {
      pesoKg: 42,
      altoCm: 180,
      anchoCm: 90,
      largoCm: 35,
      bultos: 2,
      valorDeclarado: 189900,
      transportistasPermitidos: ["via-cargo"],
      requiereCotizacionManual: true,
    },
  },
];

function buildProduct(seed: SeedInput, index: number): Product {
  const slug = slugify(seed.nombre);
  const now = new Date(Date.now() - index * 86_400_000).toISOString();
  const imagen = generatePlaceholder(slug, seed.nombre, index);

  return {
    id: nanoid(10),
    slug,
    nombre: seed.nombre,
    descripcion: seed.descripcion,
    categoria: seed.categoria,
    precio: seed.precio,
    precioAnterior: seed.precioAnterior,
    sku: `NB-${(index + 1).toString().padStart(3, "0")}`,
    stock: seed.variantes.reduce((acc, v) => acc + v.stock, 0),
    destacado: Boolean(seed.destacado),
    nuevo: Boolean(seed.nuevo),
    agotado: false,
    activo: true,
    esProductoDePrueba: true,
    imagenes: [imagen],
    variantes: seed.variantes.map((v) => ({
      id: nanoid(6),
      ...v,
    })),
    logistica: seed.logistica,
    creadoEn: now,
    actualizadoEn: now,
  };
}

function run() {
  const products = seeds.map(buildProduct);
  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(
    path.join(dataDir, "products.json"),
    JSON.stringify(products, null, 2),
    "utf-8"
  );
  if (!fs.existsSync(path.join(dataDir, "orders.json"))) {
    fs.writeFileSync(path.join(dataDir, "orders.json"), "[]", "utf-8");
  }
  console.log(`✔ Seed completo: ${products.length} productos de ejemplo creados.`);
}

run();
