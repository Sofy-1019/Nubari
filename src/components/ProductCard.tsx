"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cartContext";
import type { Product } from "@/lib/types";
import { formatARS } from "@/lib/utils";

export default function ProductCard({ product }: { product: Product }) {
  const { addLine } = useCart();
  const discount =
    product.precioAnterior && product.precioAnterior > product.precio
      ? Math.round(100 - (product.precio / product.precioAnterior) * 100)
      : null;

  return (
    <div className="group">
      <Link href={`/productos/${product.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-nb-sand">
          <Image
            src={product.imagenes[0]}
            alt={product.nombre}
            fill
            className="object-cover transition-transform duration-500 ease-soft group-hover:scale-[1.04]"
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          />
          {discount && (
            <span className="absolute top-3 left-3 bg-nb-black text-nb-bone text-xs px-2.5 py-1">
              -{discount}%
            </span>
          )}
          {product.agotado && (
            <span className="absolute top-3 right-3 bg-nb-bone/90 text-nb-black text-xs px-2.5 py-1">
              Sin stock
            </span>
          )}
        </div>
      </Link>

      <div className="mt-4 flex items-start justify-between gap-3">
        <div>
          <Link href={`/productos/${product.slug}`}>
            <h3 className="font-serif text-lg text-nb-black leading-snug hover:text-nb-wood transition-colors">
              {product.nombre}
            </h3>
          </Link>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-nb-ink">{formatARS(product.precio)}</span>
            {product.precioAnterior && (
              <span className="text-sm text-nb-taupe line-through">
                {formatARS(product.precioAnterior)}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <Link
          href={`/productos/${product.slug}`}
          className="flex-1 text-center text-xs tracking-wide border border-nb-black py-2.5 hover:bg-nb-black hover:text-nb-bone transition-colors duration-200 focus-ring"
        >
          VER PRODUCTO
        </Link>
        <button
          disabled={product.agotado}
          onClick={() =>
            addLine({
              productId: product.id,
              variantId: product.variantes[0]?.id,
              cantidad: 1,
            })
          }
          className="flex-1 text-center text-xs tracking-wide bg-nb-wood text-nb-bone py-2.5 hover:bg-nb-roseDeep transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed focus-ring"
        >
          AGREGAR
        </button>
      </div>
    </div>
  );
}
