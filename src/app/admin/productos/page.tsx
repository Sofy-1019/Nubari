import Link from "next/link";
import Image from "next/image";
import { getAllProducts } from "@/lib/db/products";
import { formatARS } from "@/lib/utils";
import DeleteProductButton from "./DeleteProductButton";

export default function AdminProductosPage() {
  const products = getAllProducts();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-3xl text-nb-black">Productos</h1>
        <Link href="/admin/productos/nuevo" className="px-4 py-2.5 bg-nb-black text-nb-bone text-sm hover:bg-nb-ink transition-colors">
          + Nuevo producto
        </Link>
      </div>

      <div className="border border-nb-black/10 divide-y divide-nb-black/10">
        {products.map((p) => (
          <div key={p.id} className="flex items-center gap-4 p-4">
            <div className="relative w-14 h-14 bg-nb-sand overflow-hidden flex-shrink-0">
              <Image src={p.imagenes[0]} alt={p.nombre} fill className="object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-nb-black truncate">
                {p.nombre}{" "}
                {p.esProductoDePrueba && (
                  <span className="text-[10px] text-nb-taupe">(prueba)</span>
                )}
              </p>
              <p className="text-xs text-nb-stone">SKU {p.sku} · Stock interno: {p.stock}</p>
            </div>
            <p className="text-sm text-nb-ink w-24 text-right">{formatARS(p.precio)}</p>
            <span
              className={`text-xs px-2 py-1 ${
                p.activo ? "bg-green-100 text-green-800" : "bg-nb-sand text-nb-stone"
              }`}
            >
              {p.activo ? "Activo" : "Inactivo"}
            </span>
            <Link href={`/admin/productos/${p.id}`} className="text-sm text-nb-wood hover:text-nb-roseDeep">
              Editar
            </Link>
            <DeleteProductButton id={p.id} />
          </div>
        ))}
        {products.length === 0 && (
          <p className="p-6 text-sm text-nb-stone">Todavía no hay productos cargados.</p>
        )}
      </div>
    </div>
  );
}
