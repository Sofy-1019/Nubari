import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

// ==========================================================================
// Este endpoint YA NO recibe el archivo de la foto en sí (eso causaba el
// error 413 "Payload Too Large": Vercel corta las funciones serverless en
// ~4.5MB, y una foto de celular normal ya supera eso fácil).
//
// En cambio, el navegador del cliente sube el archivo DIRECTO a Vercel
// Blob Storage. Este endpoint solo le da permiso ("token") para hacerlo,
// sin que la foto pase por acá. Así no hay límite de tamaño real.
// ==========================================================================

export const runtime = "nodejs";

export async function POST(request: Request): Promise<NextResponse> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      {
        error: "El almacenamiento de imágenes no está conectado todavía.",
        detail:
          "En Vercel: Storage → Create Database → Blob → Connect to Project.",
      },
      { status: 501 }
    );
  }

  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        return {
          allowedContentTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({}),
        };
      },
      onUploadCompleted: async () => {
        // No hace falta hacer nada acá: la URL final se devuelve directo
        // al navegador que hizo la subida.
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}
