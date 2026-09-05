"use client";

import Image from "next/image";
import Link from "next/link";
import { CreditCard } from "lucide-react";
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
        <div className="relative aspect-[4/5] overflow-hidden bg-nb-card border border-nb-line/50">
          <Image
            src={product.imagenes[0]}
            alt={product.nombre}
            fill
            className="object-cover opacity-90 transition-transform duration-500 ease-soft group-hover:scale-[1.04]"
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          />
          {discount && (
            <span className="absolute top-3 left-3 bg-nb-champagne text-nb-black text-[10px] tracking-wide px-2.5 py-1 font-medium">
              -{discount}%
            </span>
          )}
          {product.agotado && (
            <span className="absolute top-3 right-3 bg-nb-black/85 text-nb-beige text-[10px] px-2.5 py-1">
              Sin stock
            </span>
          )}
        </div>
      </Link>

      <div className="mt-4">
        <Link href={`/productos/${product.slug}`}>
          <h3 className="font-serif text-lg text-nb-cream leading-snug hover:text-nb-champagne transition-colors">
            {product.nombre}
          </h3>
        </Link>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-nb-champagne">{formatARS(product.precio)}</span>
          {product.precioAnterior && (
            <span className="text-sm text-nb-beige/40 line-through">
              {formatARS(product.precioAnterior)}
            </span>
          )}
        </div>
        <p className="text-[11px] text-nb-beige/45 mt-0.5">Precio por transferencia</p>
        {product.mercadoPagoLink && (
          <a
            href={product.mercadoPagoLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="mt-1.5 inline-flex items-center gap-1.5 text-[11px] text-nb-champagne hover:text-nb-gold transition-colors border border-nb-champagne/40 px-2 py-1"
          >
            <CreditCard size={11} /> 6 cuotas sin interés
          </a>
        )}
      </div>

      <div className="mt-3 flex gap-2">
        <Link
          href={`/productos/${product.slug}`}
          className="flex-1 text-center text-[11px] tracking-widest3 uppercase border border-nb-beige/30 text-nb-beige py-2.5 hover:border-nb-champagne hover:text-nb-champagne transition-colors duration-200 focus-ring"
        >
          Ver producto
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
          className="flex-1 text-center text-[11px] tracking-widest3 uppercase bg-nb-champagne text-nb-black py-2.5 hover:bg-nb-gold transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed focus-ring"
        >
          Agregar
        </button>
      </div>
    </div>
  );
}
