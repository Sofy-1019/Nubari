import { NextResponse } from "next/server";
import { readAll, writeAll } from "@/lib/db/jsonStore";

export async function GET() {
  const tieneBlob = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
  const tienePassword = Boolean(process.env.ADMIN_PASSWORD);

  let blobPrueba: { ok: boolean; detalle: string } = { ok: false, detalle: "No probado" };
  let productosPrueba: { ok: boolean; detalle: string } = { ok: false, detalle: "No probado" };

  if (tieneBlob) {
    try {
      const { put, del } = await import("@vercel/blob");
      const resultado = await put(
        "db/diagnostico-test.json",
        JSON.stringify({ probado: new Date().toISOString() }),
        { access: "private", addRandomSuffix: false, allowOverwrite: true, contentType: "application/json" }
      );
      await del(resultado.url).catch(() => {});
      blobPrueba = { ok: true, detalle: "Se pudo escribir y borrar un archivo de prueba correctamente." };
    } catch (err) {
      blobPrueba = { ok: false, detalle: (err as Error).message };
    }

    try {
      const productos = await readAll<{ id: string; nombre: string }>("products");
      productosPrueba = {
        ok: true,
        detalle: `Se encontraron ${productos.length} producto(s): ${productos
          .map((p) => p.nombre)
          .join(", ") || "(ninguno)"}`,
      };
    } catch (err) {
      productosPrueba = { ok: false, detalle: (err as Error).message };
    }
  } else {
    blobPrueba = { ok: false, detalle: "BLOB_READ_WRITE_TOKEN no está configurado en Vercel." };
  }

  return NextResponse.json({ tieneBlob, tienePassword, blobPrueba, productosPrueba });
}
