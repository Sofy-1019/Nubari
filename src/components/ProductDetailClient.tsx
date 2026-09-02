"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { MessageCircle, Minus, Plus } from "lucide-react";
import type { Product } from "@/lib/types";
import { buildWhatsAppLink, formatARS, productWhatsAppMessage } from "@/lib/utils";
import { useCart } from "@/lib/cartContext";
import ShippingCalculator from "./ShippingCalculator";

export default function ProductDetailClient({ product }: { product: Product }) {
  const { addLine } = useCart();
  const router = useRouter();
  const [activeImg, setActiveImg] = useState(0);
  const [variantId, setVariantId] = useState(product.variantes[0]?.id);
  const [cantidad, setCantidad] = useState(1);

  const variant = product.variantes.find((v) => v.id === variantId);
  const precioFinal = product.precio + (variant?.priceDelta ?? 0);
  const sinStock = product.agotado || (variant ? variant.stock <= 0 : product.stock <= 0);

  const whatsappHref = useMemo(
    () =>
      buildWhatsAppLink(
        productWhatsAppMessage({
          nombre: product.nombre,
          variante: [variant?.color, variant?.material, variant?.medida]
            .filter(Boolean)
            .join(" · "),
          precio: precioFinal,
          cantidad,
        })
      ),
    [product.nombre, variant, precioFinal, cantidad]
  );

  function handleAgregar() {
    addLine({ productId: product.id, variantId, cantidad });
  }

  function handleComprarAhora() {
    handleAgregar();
    router.push("/carrito");
  }

  return (
    <div className="container-nb py-14">
      <div className="grid md:grid-cols-2 gap-12">
        {/* GALLERY */}
        <div>
          <div className="relative aspect-[4/5] bg-nb-sand overflow-hidden">
            <Image
              src={product.imagenes[activeImg]}
              alt={product.nombre}
              fill
              priority
              className="object-cover"
            />
          </div>
          {product.imagenes.length > 1 && (
            <div className="flex gap-2 mt-3">
              {product.imagenes.map((img, i) => (
                <button
                  key={img}
                  onClick={() => setActiveImg(i)}
                  className={`relative w-16 h-16 overflow-hidden border ${
                    i === activeImg ? "border-nb-wood" : "border-transparent"
                  }`}
                >
                  <Image src={img} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* INFO */}
        <div>
          {product.esProductoDePrueba && (
            <span className="inline-block text-[11px] tracking-wide bg-nb-sand text-nb-stone px-2 py-1 mb-3">
              PRODUCTO DE PRUEBA
            </span>
          )}
          <h1 className="font-serif text-3xl sm:text-4xl text-nb-black">{product.nombre}</h1>
          <div className="mt-3 flex items-center gap-3">
            <span className="text-xl text-nb-black">{formatARS(precioFinal)}</span>
            {product.precioAnterior && (
              <span className="text-nb-taupe line-through">{formatARS(product.precioAnterior)}</span>
            )}
          </div>

          <p className="mt-6 text-nb-stone leading-relaxed">{product.descripcion}</p>

          <div className="mt-6 grid grid-cols-3 gap-4 text-sm text-nb-stone border-y border-nb-black/10 py-4">
            <div>
              <p className="text-nb-taupe text-xs mb-1">Medidas</p>
              {product.logistica.largoCm}×{product.logistica.anchoCm}×{product.logistica.altoCm} cm
            </div>
            <div>
              <p className="text-nb-taupe text-xs mb-1">Peso</p>
              {product.logistica.pesoKg} kg
            </div>
            <div>
              <p className="text-nb-taupe text-xs mb-1">Materiales</p>
              {variant?.material || "Consultar"}
            </div>
          </div>

          {product.variantes.length > 1 && (
            <div className="mt-6">
              <p className="text-xs tracking-widest2 text-nb-taupe mb-2">VARIANTE</p>
              <div className="flex flex-wrap gap-2">
                {product.variantes.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setVariantId(v.id)}
                    className={`px-3.5 py-2 text-sm border transition-colors ${
                      v.id === variantId
                        ? "border-nb-black bg-nb-black text-nb-bone"
                        : "border-nb-black/25 text-nb-ink hover:border-nb-black"
                    }`}
                  >
                    {[v.color, v.material, v.medida].filter(Boolean).join(" · ")}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center gap-4">
            <p className="text-xs tracking-widest2 text-nb-taupe">CANTIDAD</p>
            <div className="flex items-center border border-nb-black/20">
              <button
                onClick={() => setCantidad((q) => Math.max(1, q - 1))}
                className="p-2.5 hover:bg-nb-sand transition-colors"
                aria-label="Restar"
              >
                <Minus size={14} />
              </button>
              <span className="w-10 text-center text-sm">{cantidad}</span>
              <button
                onClick={() => setCantidad((q) => q + 1)}
                className="p-2.5 hover:bg-nb-sand transition-colors"
                aria-label="Sumar"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          <div className="mt-7 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleAgregar}
              disabled={sinStock}
              className="flex-1 py-3.5 border border-nb-black text-sm tracking-wide hover:bg-nb-black hover:text-nb-bone transition-colors duration-200 disabled:opacity-40 focus-ring"
            >
              AGREGAR AL CARRITO
            </button>
            <button
              onClick={handleComprarAhora}
              disabled={sinStock}
              className="flex-1 py-3.5 bg-nb-wood text-nb-bone text-sm tracking-wide hover:bg-nb-roseDeep transition-colors duration-200 disabled:opacity-40 focus-ring"
            >
              COMPRAR AHORA
            </button>
          </div>

          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-2 text-sm text-nb-stone hover:text-nb-wood transition-colors"
          >
            <MessageCircle size={16} /> Consultar por WhatsApp
          </a>

          <div className="mt-8">
            <ShippingCalculator
              lines={[{ productId: product.id, variantId, cantidad }]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
