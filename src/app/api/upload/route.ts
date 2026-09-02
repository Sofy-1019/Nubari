import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";

// ==========================================================================
// Sube archivos de imagen reales a Vercel Blob Storage y devuelve las URLs
// públicas para guardarlas en el producto.
//
// Requiere que el proyecto tenga conectado un "Blob store" en Vercel
// (Storage → Create Database → Blob → Connect to Project). Una vez
// conectado, Vercel agrega automáticamente la variable de entorno
// BLOB_READ_WRITE_TOKEN — no hace falta configurarla a mano.
// ==========================================================================

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      {
        error: "El almacenamiento de imágenes no está conectado todavía.",
        detail:
          "En Vercel: Storage → Create Database → Blob → Connect to Project. " +
          "Una vez conectado, esta función empieza a funcionar sin más pasos.",
      },
      { status: 501 }
    );
  }

  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No se recibió ninguna imagen." }, { status: 400 });
    }

    const uploaded = await Promise.all(
      files.map(async (file) => {
        const ext = file.name.split(".").pop() || "jpg";
        const key = `productos/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const blob = await put(key, file, { access: "public" });
        return blob.url;
      })
    );

    return NextResponse.json({ urls: uploaded });
  } catch (err) {
    return NextResponse.json(
      { error: "No se pudieron subir las imágenes", detail: (err as Error).message },
      { status: 500 }
    );
  }
}
