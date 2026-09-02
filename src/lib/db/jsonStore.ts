import fs from "fs";
import path from "path";

// ==========================================================================
// Almacenamiento simple basado en archivos JSON.
//
// Esto funciona como una base de datos real desde el punto de vista de la
// aplicación (todo pasa por funciones async, hay un único punto de acceso),
// pero es fácil de reemplazar: para producción, se recomienda migrar este
// archivo a Prisma + PostgreSQL/SQLite manteniendo la misma interfaz
// (readAll/writeAll) para no tener que tocar el resto del código.
// ==========================================================================

const DATA_DIR = path.join(process.cwd(), "data");

function filePath(name: string) {
  return path.join(DATA_DIR, `${name}.json`);
}

export function readAll<T>(name: string): T[] {
  const file = filePath(name);
  if (!fs.existsSync(file)) return [];
  const raw = fs.readFileSync(file, "utf-8");
  if (!raw.trim()) return [];
  return JSON.parse(raw) as T[];
}

export function writeAll<T>(name: string, data: T[]): void {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(filePath(name), JSON.stringify(data, null, 2), "utf-8");
}

export function readOne<T extends { id: string }>(
  name: string,
  id: string
): T | undefined {
  return readAll<T>(name).find((item) => item.id === id);
}

export function upsert<T extends { id: string }>(name: string, item: T): T {
  const all = readAll<T>(name);
  const idx = all.findIndex((i) => i.id === item.id);
  if (idx >= 0) all[idx] = item;
  else all.push(item);
  writeAll(name, all);
  return item;
}

export function remove(name: string, id: string): void {
  const all = readAll<{ id: string }>(name);
  writeAll(
    name,
    all.filter((i) => i.id !== id)
  );
}
