import Link from "next/link";
import Image from "next/image";
import { getAllProducts } from "@/lib/db/products";
import { formatARS } from "@/lib/utils";
import DeleteProductButton from "./DeleteProductButton";

export default async function AdminProductosPage() {
  const products = await getAllProducts();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-3xl text-nb-cream">Productos</h1>
        <Link
          href="/admin/productos/nuevo"
          className="px-4 py-2.5 bg-nb-champagne text-nb-black text-sm font-medium hover:bg-nb-gold transition-colors"
        >
          + Nuevo producto
        </Link>
      </div>

      <div className="border border-nb-line/60 divide-y divide-nb-line/60">
        {products.map((p) => (
          <div key={p.id} className="flex items-center gap-4 p-4 bg-nb-card">
            <div className="relative w-16 h-16 bg-nb-black/40 overflow-hidden flex-shrink-0">
              <Image src={p.imagenes[0]} alt={p.nombre} fill className="object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base text-nb-cream truncate">
                {p.nombre}{" "}
                {p.esProductoDePrueba && (
                  <span className="text-xs text-nb-beige/40">(prueba)</span>
                )}
              </p>
              <p className="text-sm text-nb-beige/55">SKU {p.sku} · Stock interno: {p.stock}</p>
            </div>
            <p className="text-base text-nb-champagne w-28 text-right">{formatARS(p.precio)}</p>
            <span
              className={`text-xs px-2.5 py-1 rounded-sm ${
                p.activo ? "bg-green-900/40 text-green-300" : "bg-nb-black/40 text-nb-beige/50"
              }`}
            >
              {p.activo ? "Activo" : "Inactivo"}
            </span>
            <Link
              href={`/admin/productos/${p.id}`}
              className="text-sm text-nb-champagne hover:text-nb-gold underline underline-offset-2"
            >
              Editar
            </Link>
            <DeleteProductButton id={p.id} />
          </div>
        ))}
        {products.length === 0 && (
          <p className="p-6 text-sm text-nb-beige/55 bg-nb-card">Todavía no hay productos cargados.</p>
        )}
      </div>
    </div>
  );
}
