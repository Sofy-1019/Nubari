// ==========================================================================
// NUBARI — Carga de fotos con Cloudinary
// ==========================================================================
// Reemplaza al sistema anterior (Vercel Blob), que dependía de un token
// que había que "conectar" en Vercel y volver a desplegar cada vez que
// fallaba. Este es mucho más simple: Cloudinary tiene un plan gratuito
// (25 GB, sin tarjeta) y permite subir fotos DIRECTO desde el navegador
// del cliente con sólo dos datos públicos (no son contraseñas ni tokens
// secretos, así que es seguro tenerlos escritos acá abajo).
//
// PARA ACTIVARLO (una sola vez, 2 minutos):
//   1. Entrá a https://cloudinary.com/users/register/free y creá una
//      cuenta gratis (con tu mail, sin tarjeta).
//   2. En el Dashboard vas a ver "Cloud name" arriba de todo. Copialo y
//      reemplazá CLOUD_NAME acá abajo.
//   3. Andá a Settings (ícono de tuerca) → pestaña "Upload" → botón
//      "Add upload preset".
//   4. Ponele un nombre (ej: "nubari_productos"), y en "Signing Mode"
//      elegí "Unsigned". Guardar.
//   5. Copiá ese nombre y reemplazá UPLOAD_PRESET acá abajo.
//
// Con esos dos datos alcanza — no hace falta ninguna variable de entorno
// en Vercel, ni redeploy, ni tokens. Se sube directo del celular/compu
// del cliente a Cloudinary, sin pasar por el servidor de Nubari.
// ==========================================================================

export const CLOUDINARY_CLOUD_NAME: string = "luqdh4j7";
export const CLOUDINARY_UPLOAD_PRESET: string = "nubari";

export const CLOUDINARY_CONFIGURED =
  CLOUDINARY_CLOUD_NAME !== "TU_CLOUD_NAME_ACA" &&
  CLOUDINARY_UPLOAD_PRESET !== "TU_UPLOAD_PRESET_ACA";

// Tamaño máximo de lado (ancho o alto) que va a tener cualquier foto de
// producto una vez subida. Una foto de celular moderna (12-15 MB, 4000px)
// puede tardar mucho o directamente fallar en subirse con datos móviles.
// Achicándola en el propio navegador ANTES de mandarla, queda liviana
// (normalmente menos de 1 MB) sin que se note la pérdida de calidad en
// pantalla, y sube mucho más rápido.
const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.82;

/**
 * Redimensiona y comprime una foto en el navegador (usando <canvas>) antes
 * de subirla, para que las fotos de celular (que suelen pesar varios MB)
 * no tarden una eternidad ni fallen por ser demasiado pesadas.
 */
async function compressImage(file: File): Promise<File> {
  // Si ya es chica, ni la tocamos.
  if (file.size < 700_000) return file;

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);

    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY)
    );
    if (!blob || blob.size >= file.size) return file;

    const newName = file.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], newName, { type: "image/jpeg" });
  } catch {
    // Si algo falla al comprimir, subimos la original tal cual.
    return file;
  }
}

/**
 * Sube un archivo directo a Cloudinary desde el navegador y devuelve la
 * URL pública final de la imagen ya alojada. Antes de subir, la achica
 * si es una foto pesada (ver compressImage arriba).
 */
export async function uploadImageToCloudinary(file: File): Promise<string> {
  if (!CLOUDINARY_CONFIGURED) {
    throw new Error(
      "El almacenamiento de fotos todavía no está conectado. Hay que crear una cuenta gratis en Cloudinary y cargar los dos datos en el código (ver src/lib/cloudinary.ts)."
    );
  }

  const optimized = await compressImage(file);

  const formData = new FormData();
  formData.append("file", optimized);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  formData.append("folder", "nubari-productos");

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData }
  );

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(
      data?.error?.message || `No se pudo subir la foto (error ${res.status}).`
    );
  }

  const data = (await res.json()) as { secure_url: string };
  return data.secure_url;
}
