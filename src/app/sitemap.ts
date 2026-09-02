import type { MetadataRoute } from "next";
import { getActiveProducts } from "@/lib/db/products";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const staticRoutes = ["", "/productos", "/categorias", "/nosotros", "/contacto"].map(
    (r) => ({ url: `${base}${r}`, lastModified: new Date() })
  );
  const productRoutes = getActiveProducts().map((p) => ({
    url: `${base}/productos/${p.slug}`,
    lastModified: p.actualizadoEn,
  }));
  return [...staticRoutes, ...productRoutes];
}
