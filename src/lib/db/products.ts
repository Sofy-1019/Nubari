import { nanoid } from "nanoid";
import { readAll, readOne, upsert, remove } from "./jsonStore";
import type { Product, ProductCategory } from "../types";

const COLLECTION = "products";

export function getAllProducts(): Product[] {
  return readAll<Product>(COLLECTION);
}

export function getActiveProducts(): Product[] {
  return getAllProducts().filter((p) => p.activo);
}

export function getProductBySlug(slug: string): Product | undefined {
  return getAllProducts().find((p) => p.slug === slug);
}

export function getProductById(id: string): Product | undefined {
  return readOne<Product>(COLLECTION, id);
}

export interface ProductFilters {
  categoria?: ProductCategory;
  precioMin?: number;
  precioMax?: number;
  color?: string;
  material?: string;
  soloDisponibles?: boolean;
  ordenar?: "destacados" | "mas-vendidos" | "precio-asc" | "precio-desc" | "novedades";
}

export function queryProducts(filters: ProductFilters): Product[] {
  let items = getActiveProducts();

  if (filters.categoria) {
    items = items.filter((p) => p.categoria === filters.categoria);
  }
  if (filters.precioMin != null) {
    items = items.filter((p) => p.precio >= filters.precioMin!);
  }
  if (filters.precioMax != null) {
    items = items.filter((p) => p.precio <= filters.precioMax!);
  }
  if (filters.color) {
    items = items.filter((p) =>
      p.variantes.some((v) => v.color?.toLowerCase() === filters.color!.toLowerCase())
    );
  }
  if (filters.material) {
    items = items.filter((p) =>
      p.variantes.some(
        (v) => v.material?.toLowerCase() === filters.material!.toLowerCase()
      )
    );
  }
  if (filters.soloDisponibles) {
    items = items.filter((p) => !p.agotado && p.stock > 0);
  }

  switch (filters.ordenar) {
    case "precio-asc":
      items = [...items].sort((a, b) => a.precio - b.precio);
      break;
    case "precio-desc":
      items = [...items].sort((a, b) => b.precio - a.precio);
      break;
    case "novedades":
      items = [...items].sort(
        (a, b) => +new Date(b.creadoEn) - +new Date(a.creadoEn)
      );
      break;
    case "destacados":
      items = [...items].sort((a, b) => Number(b.destacado) - Number(a.destacado));
      break;
    // "mas-vendidos" requeriría datos de ventas reales; se deja el orden
    // por defecto (destacados primero) hasta incorporar analíticas de pedidos.
    default:
      items = [...items].sort((a, b) => Number(b.destacado) - Number(a.destacado));
  }

  return items;
}

export function createProduct(
  data: Omit<Product, "id" | "creadoEn" | "actualizadoEn">
): Product {
  const now = new Date().toISOString();
  const product: Product = {
    ...data,
    id: nanoid(10),
    creadoEn: now,
    actualizadoEn: now,
  };
  return upsert(COLLECTION, product);
}

export function updateProduct(
  id: string,
  data: Partial<Omit<Product, "id" | "creadoEn">>
): Product | undefined {
  const existing = getProductById(id);
  if (!existing) return undefined;
  const updated: Product = {
    ...existing,
    ...data,
    actualizadoEn: new Date().toISOString(),
  };
  return upsert(COLLECTION, updated);
}

export function deleteProduct(id: string): void {
  remove(COLLECTION, id);
}
