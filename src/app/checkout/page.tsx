"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/lib/cartContext";
import type { Product } from "@/lib/types";
import { formatARS } from "@/lib/utils";

const FIELDS: { name: string; label: string; required?: boolean; span?: number }[] = [
  { name: "nombre", label: "Nombre", required: true },
  { name: "apellido", label: "Apellido", required: true },
  { name: "email", label: "Email", required: true, span: 2 },
  { name: "telefono", label: "Teléfono", required: true },
  { name: "codigoPostal", label: "Código postal", required: true },
  { name: "direccion", label: "Dirección", required: true },
  { name: "numero", label: "Número", required: true },
  { name: "pisoDepto", label: "Piso / Depto" },
  { name: "localidad", label: "Localidad", required: true },
  { name: "provincia", label: "Provincia", required: true },
];

export default function CheckoutPage() {
  const { lines, selectedShipping, direccion, clearCart } = useCart();
  const router = useRouter();
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [form, setForm] = useState<Record<string, string>>({
    codigoPostal: direccion?.codigoPostal || "",
    direccion: direccion?.direccion || "",
    numero: direccion?.numero || "",
    localidad: direccion?.localidad || "",
    provincia: direccion?.provincia || "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      entries.forEach((e) => e && (map[e[0]] = e[1]));
      setProducts(map);
    }
    load();
  }, [lines]);

  const subtotal = lines.reduce((acc, l) => {
    const p = products[l.productId];
    if (!p) return acc;
    const variant = p.variantes.find((v) => v.id === l.variantId);
    return acc + (p.precio + (variant?.priceDelta ?? 0)) * l.cantidad;
  }, 0);
  const total = subtotal + (selectedShipping?.price ?? 0);

  function handleChange(name: string, value: string) {
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!selectedShipping) {
      setError("Elegí un método de envío antes de continuar (volvé al carrito).");
      return;
    }
    for (const f of FIELDS) {
      if (f.required && !form[f.name]?.trim()) {
        setError(`Completá el campo "${f.label}".`);
        return;
      }
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cliente: form, lines, envio: selectedShipping }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo generar el pedido.");
        return;
      }
      clearCart();
      router.push(`/checkout/confirmacion?numero=${data.numero}`);
    } catch {
      setError("No se pudo generar el pedido. Intentá nuevamente.");
    } finally {
      setSubmitting(false);
    }
  }

  if (lines.length === 0) {
    return (
      <div className="container-nb py-28 text-center">
        <p className="text-nb-beige/50">Tu carrito está vacío.</p>
        <Link href="/productos" className="text-nb-champagne hover:text-nb-gold">
          Ver colección →
        </Link>
      </div>
    );
  }

  return (
    <div className="container-nb py-14">
      <h1 className="font-serif text-3xl text-nb-cream mb-10">Checkout</h1>

      <div className="grid lg:grid-cols-[1fr_380px] gap-14">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            {FIELDS.map((f) => (
              <div key={f.name} className={f.span === 2 ? "sm:col-span-2" : ""}>
                <label className="block text-[11px] tracking-wide text-nb-beige/55 mb-1.5">
                  {f.label}
                  {f.required && " *"}
                </label>
                <input
                  value={form[f.name] || ""}
                  onChange={(e) => handleChange(f.name, e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-nb-black/40 border border-nb-line/60 text-nb-cream text-sm focus-ring focus:border-nb-champagne outline-none"
                />
              </div>
            ))}
          </div>

          {!selectedShipping && (
            <p className="text-sm text-nb-beige/55">
              No elegiste un método de envío todavía.{" "}
              <Link href="/carrito" className="text-nb-champagne hover:text-nb-gold">
                Volver al carrito
              </Link>
            </p>
          )}

          <div className="border-t border-nb-line/50 pt-5">
            <p className="text-[11px] tracking-widest3 uppercase text-nb-beige/45 mb-2">Método de pago</p>
            <p className="text-sm text-nb-beige/60">
              La integración con Mercado Pago está preparada y pendiente de credenciales.
              Por ahora, tu pedido queda registrado como <strong className="text-nb-cream">pendiente de pago</strong> y
              te contactaremos para coordinarlo.
            </p>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-nb-champagne text-nb-black text-xs tracking-widest3 uppercase hover:bg-nb-gold transition-colors disabled:opacity-50 focus-ring"
          >
            {submitting ? "Generando pedido…" : "Confirmar pedido"}
          </button>
        </form>

        <aside className="border border-nb-line/60 bg-nb-card p-6 h-fit">
          <h2 className="font-serif text-xl text-nb-cream mb-5">Tu pedido</h2>
          <div className="space-y-3 text-sm">
            {lines.map((l) => {
              const p = products[l.productId];
              if (!p) return null;
              return (
                <div key={`${l.productId}-${l.variantId}`} className="flex justify-between text-nb-beige/60">
                  <span>
                    {p.nombre} × {l.cantidad}
                  </span>
                  <span>{formatARS(p.precio * l.cantidad)}</span>
                </div>
              );
            })}
          </div>
          <div className="border-t border-nb-line/50 mt-4 pt-4 space-y-2 text-sm">
            <div className="flex justify-between text-nb-beige/60">
              <span>Subtotal</span>
              <span>{formatARS(subtotal)}</span>
            </div>
            <div className="flex justify-between text-nb-beige/60">
              <span>Envío {selectedShipping ? `(${selectedShipping.carrierLabel})` : ""}</span>
              <span>{selectedShipping ? formatARS(selectedShipping.price) : "—"}</span>
            </div>
          </div>
          <div className="border-t border-nb-line/50 mt-3 pt-3 flex justify-between text-nb-cream">
            <span>Total</span>
            <span className="text-lg text-nb-champagne">{formatARS(total)}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
