import { nanoid } from "nanoid";
import { readAll, readOne, upsert, remove } from "./jsonStore";
import type { Product, ProductCategory } from "../types";

const COLLECTION = "products";

export async function getAllProducts(): Promise<Product[]> {
  return readAll<Product>(COLLECTION);
}

export async function getActiveProducts(): Promise<Product[]> {
  return (await getAllProducts()).filter((p) => p.activo);
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  return (await getAllProducts()).find((p) => p.slug === slug);
}

export async function getProductById(id: string): Promise<Product | undefined> {
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

export async function queryProducts(filters: ProductFilters): Promise<Product[]> {
  let items = await getActiveProducts();

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
    default:
      items = [...items].sort((a, b) => Number(b.destacado) - Number(a.destacado));
  }

  return items;
}

export async function createProduct(
  data: Omit<Product, "id" | "creadoEn" | "actualizadoEn">
): Promise<Product> {
  const now = new Date().toISOString();
  const product: Product = {
    ...data,
    id: nanoid(10),
    creadoEn: now,
    actualizadoEn: now,
  };
  return upsert(COLLECTION, product);
}

export async function updateProduct(
  id: string,
  data: Partial<Omit<Product, "id" | "creadoEn">>
): Promise<Product | undefined> {
  const existing = await getProductById(id);
  if (!existing) return undefined;
  const updated: Product = {
    ...existing,
    ...data,
    actualizadoEn: new Date().toISOString(),
  };
  return upsert(COLLECTION, updated);
}

export async function deleteProduct(id: string): Promise<void> {
  await remove(COLLECTION, id);
}
