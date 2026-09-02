export function formatARS(value: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export const CATEGORY_LABELS: Record<string, string> = {
  banquetas: "Banquetas",
  organizacion: "Organización",
  cocina: "Cocina",
  hogar: "Hogar",
  oficina: "Oficina",
  novedades: "Novedades",
};

export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5491100000000";

export function buildWhatsAppLink(message: string): string {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`;
}

export function productWhatsAppMessage(params: {
  nombre: string;
  variante?: string;
  precio: number;
  cantidad: number;
}): string {
  const lineas = [
    "Hola, quiero consultar por:",
    "",
    `Producto: ${params.nombre}`,
  ];
  if (params.variante) lineas.push(`Variante: ${params.variante}`);
  lineas.push(`Precio: ${formatARS(params.precio)}`);
  lineas.push(`Cantidad: ${params.cantidad}`);
  return lineas.join("\n");
}
