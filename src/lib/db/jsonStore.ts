import fs from "fs";
import path from "path";
import { put, list } from "@vercel/blob";

// ==========================================================================
// Almacenamiento de datos.
//
// En desarrollo local (sin BLOB_READ_WRITE_TOKEN) sigue leyendo/escribiendo
// los archivos data/*.json como antes.
//
// En producción (Vercel), el sistema de archivos NO es persistente entre
// invocaciones de una función serverless: escribir con fs.writeFileSync
// "funciona" en el momento pero se pierde enseguida. Por eso, cuando existe
// BLOB_READ_WRITE_TOKEN (Storage → Blob conectado al proyecto), los datos se
// guardan y leen desde Vercel Blob, que sí persiste.
//
// La primera vez que se lee una colección y todavía no existe nada en Blob,
// se usa como semilla el archivo data/*.json que viene incluido en el
// deploy (los productos de ejemplo). En cuanto se hace la primera escritura
// (por ejemplo, crear un producto desde el admin), Blob pasa a ser la
// única fuente de verdad para esa colección.
// ==========================================================================

const DATA_DIR = path.join(process.cwd(), "data");
const BLOB_PREFIX = "db/";

function filePath(name: string) {
  return path.join(DATA_DIR, `${name}.json`);
}

function hasBlob(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function readLocal<T>(name: string): T[] {
  const file = filePath(name);
  if (!fs.existsSync(file)) return [];
  const raw = fs.readFileSync(file, "utf-8");
  if (!raw.trim()) return [];
  return JSON.parse(raw) as T[];
}

function writeLocal<T>(name: string, data: T[]): void {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(filePath(name), JSON.stringify(data, null, 2), "utf-8");
}

export async function readAll<T>(name: string): Promise<T[]> {
  if (hasBlob()) {
    try {
      const { blobs } = await list({ prefix: `${BLOB_PREFIX}${name}.json`, limit: 1 });
      if (blobs.length > 0) {
        const res = await fetch(blobs[0].url, { cache: "no-store" });
        if (res.ok) {
          const text = await res.text();
          if (text.trim()) return JSON.parse(text) as T[];
        }
      }
    } catch {
      // Si falla la consulta a Blob, seguimos con el respaldo local
      // en vez de romper la página.
    }
  }
  return readLocal<T>(name);
}

export async function writeAll<T>(name: string, data: T[]): Promise<void> {
  if (hasBlob()) {
    await put(`${BLOB_PREFIX}${name}.json`, JSON.stringify(data, null, 2), {
      access: "public",
      addRandomSuffix: false,
      contentType: "application/json",
    });
    return;
  }
  writeLocal(name, data);
}

export async function readOne<T extends { id: string }>(
  name: string,
  id: string
): Promise<T | undefined> {
  const all = await readAll<T>(name);
  return all.find((item) => item.id === id);
}

export async function upsert<T extends { id: string }>(name: string, item: T): Promise<T> {
  const all = await readAll<T>(name);
  const idx = all.findIndex((i) => i.id === item.id);
  if (idx >= 0) all[idx] = item;
  else all.push(item);
  await writeAll(name, all);
  return item;
}

export async function remove(name: string, id: string): Promise<void> {
  const all = await readAll<{ id: string }>(name);
  await writeAll(
    name,
    all.filter((i) => i.id !== id)
  );
}
