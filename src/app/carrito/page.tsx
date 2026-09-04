"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/lib/cartContext";
import type { Product } from "@/lib/types";
import { formatARS } from "@/lib/utils";
import ShippingCalculator from "@/components/ShippingCalculator";

export default function CarritoPage() {
  const { lines, updateQuantity, removeLine, clearCart, selectedShipping } = useCart();
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const entries = await Promise.all(
        lines.map(async (l) => {
          const res = await fetch(`/api/products/${l.productId}`);
          if (!res.ok) return null;
          const p: Product = await res.json();
          return [l.productId, p] as const;
        })
      );
      const map: Record<string, Product> = {};
      entries.forEach((e) => {
        if (e) map[e[0]] = e[1];
      });
      setProducts(map);
      setLoading(false);
    }
    if (lines.length > 0) load();
    else setLoading(false);
  }, [lines]);

  const subtotal = lines.reduce((acc, l) => {
    const p = products[l.productId];
    if (!p) return acc;
    const variant = p.variantes.find((v) => v.id === l.variantId);
    return acc + (p.precio + (variant?.priceDelta ?? 0)) * l.cantidad;
  }, 0);

  const envio = selectedShipping?.price ?? 0;
  const total = subtotal + envio;

  if (loading) {
    return <div className="container-nb py-24 text-center text-nb-beige/50">Cargando carrito…</div>;
  }

  if (lines.length === 0) {
    return (
      <div className="container-nb py-28 text-center">
        <h1 className="font-serif text-3xl text-nb-cream mb-4">Tu carrito está vacío</h1>
        <Link href="/productos" className="text-nb-champagne hover:text-nb-gold transition-colors">
          Ver colección →
        </Link>
      </div>
    );
  }

  return (
    <div className="container-nb py-14">
      <h1 className="font-serif text-3xl text-nb-cream mb-10">Tu carrito</h1>

      <div className="grid lg:grid-cols-[1fr_380px] gap-14">
        <div>
          <div className="space-y-6">
            {lines.map((line) => {
              const p = products[line.productId];
              if (!p) return null;
              const variant = p.variantes.find((v) => v.id === line.variantId);
              const precio = p.precio + (variant?.priceDelta ?? 0);
              return (
                <div
                  key={`${line.productId}-${line.variantId}`}
                  className="flex gap-4 border-b border-nb-line/50 pb-6"
                >
                  <div className="relative w-24 h-28 bg-nb-card border border-nb-line/50 flex-shrink-0 overflow-hidden">
                    <Image src={p.imagenes[0]} alt={p.nombre} fill className="object-cover" />
                  </div>
                  <div className="flex-1">
                    <Link href={`/productos/${p.slug}`} className="font-serif text-lg text-nb-cream hover:text-nb-champagne">
                      {p.nombre}
                    </Link>
                    {variant && (
                      <p className="text-sm text-nb-beige/50 mt-0.5">
                        {[variant.color, variant.material, variant.medida].filter(Boolean).join(" · ")}
                      </p>
                    )}
                    <p className="text-sm text-nb-champagne mt-1">{formatARS(precio)}</p>

                    <div className="mt-3 flex items-center gap-4">
                      <div className="flex items-center border border-nb-line/60">
                        <button
                          onClick={() => updateQuantity(line.productId, line.variantId, line.cantidad - 1)}
                          className="p-2 hover:bg-nb-black/40 transition-colors text-nb-beige"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="w-8 text-center text-sm text-nb-cream">{line.cantidad}</span>
                        <button
                          onClick={() => updateQuantity(line.productId, line.variantId, line.cantidad + 1)}
                          className="p-2 hover:bg-nb-black/40 transition-colors text-nb-beige"
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                      <button
                        onClick={() => removeLine(line.productId, line.variantId)}
                        className="text-nb-beige/40 hover:text-red-400 transition-colors"
                        aria-label="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-nb-cream">{formatARS(precio * line.cantidad)}</p>
                </div>
              );
            })}
          </div>

          <button onClick={clearCart} className="mt-6 text-sm text-nb-beige/40 hover:text-red-400 transition-colors">
            Vaciar carrito
          </button>

          <div className="mt-10">
            <ShippingCalculator lines={lines} />
          </div>
        </div>

        <aside className="border border-nb-line/60 bg-nb-card p-6 h-fit sticky top-28">
          <h2 className="font-serif text-xl text-nb-cream mb-5">Resumen</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-nb-beige/60">
              <span>Subtotal</span>
              <span>{formatARS(subtotal)}</span>
            </div>
            <div className="flex justify-between text-nb-beige/60">
              <span>Envío</span>
              <span>{selectedShipping ? formatARS(envio) : "A calcular"}</span>
            </div>
          </div>
          <div className="border-t border-nb-line/50 mt-4 pt-4 flex justify-between text-nb-cream">
            <span>Total</span>
            <span className="text-lg text-nb-champagne">{formatARS(total)}</span>
          </div>
          <Link
            href="/checkout"
            className="mt-6 block text-center py-3.5 bg-nb-champagne text-nb-black text-xs tracking-widest3 uppercase hover:bg-nb-gold transition-colors focus-ring"
          >
            Ir al checkout
          </Link>
        </aside>
      </div>
    </div>
  );
}
