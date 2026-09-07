"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { CreditCard, MessageCircle, Minus, Plus, X } from "lucide-react";
import type { Product, TelaTipo } from "@/lib/types";
import { buildWhatsAppLink, formatARS, productWhatsAppMessage, TELA_LABELS } from "@/lib/utils";
import { useCart } from "@/lib/cartContext";
import ShippingCalculator from "./ShippingCalculator";

export default function ProductDetailClient({ product }: { product: Product }) {
  const { addLine } = useCart();
  const router = useRouter();
  const [activeImg, setActiveImg] = useState(0);
  const [variantId, setVariantId] = useState(product.variantes[0]?.id);
  const [largoId, setLargoId] = useState(product.largos?.[0]?.id);
  const [cantidad, setCantidad] = useState(1);

  // Tela (tapizado): qué tipo y qué color del catálogo eligió el cliente.
  const [telaTipo, setTelaTipo] = useState<TelaTipo | undefined>(undefined);
  const [telaColorId, setTelaColorId] = useState<string | undefined>(undefined);
  // Catálogo abierto en este momento (null = cerrado).
  const [catalogoAbierto, setCatalogoAbierto] = useState<TelaTipo | null>(null);
  // Color tocado dentro del catálogo, mostrado en grande antes de confirmar.
  const [colorEnGrande, setColorEnGrande] = useState<string | null>(null);

  const variant = product.variantes.find((v) => v.id === variantId);
  const largo = product.largos?.find((m) => m.id === largoId);
  const telaSeleccionada = product.telas?.find((t) => t.tipo === telaTipo);
  const colorSeleccionado = telaSeleccionada?.colores.find((c) => c.id === telaColorId);
  const catalogo = product.telas?.find((t) => t.tipo === catalogoAbierto);
  const colorEnPreview = catalogo?.colores.find((c) => c.id === colorEnGrande);

  const precioFinal = product.precio + (variant?.priceDelta ?? 0) + (largo?.priceDelta ?? 0);
  const stockVariante = variant ? variant.stock : product.stock;
  const sinStock = product.agotado || stockVariante <= 0;

  // Si el color elegido tiene su propia foto, se muestra esa; si no, se
  // sigue mostrando la galería general de fotos del producto.
  const imagenPrincipal = variant?.imagen || product.imagenes[activeImg];

  function elegirVariante(id: string) {
    setVariantId(id);
    setActiveImg(0);
  }

  function abrirCatalogo(tipo: TelaTipo) {
    setCatalogoAbierto(tipo);
    setColorEnGrande(null);
  }

  function cerrarCatalogo() {
    setCatalogoAbierto(null);
    setColorEnGrande(null);
  }

  function confirmarColorTela() {
    if (!catalogoAbierto || !colorEnGrande) return;
    setTelaTipo(catalogoAbierto);
    setTelaColorId(colorEnGrande);
    cerrarCatalogo();
  }

  const whatsappHref = useMemo(
    () =>
      buildWhatsAppLink(
        productWhatsAppMessage({
          nombre: product.nombre,
          variante: [
            variant?.color,
            variant?.material,
            largo ? `${largo.cm} cm` : null,
            colorSeleccionado ? `${TELA_LABELS[telaTipo!]} ${colorSeleccionado.nombre}` : null,
          ]
            .filter(Boolean)
            .join(" · "),
          precio: precioFinal,
          cantidad,
        })
      ),
    [product.nombre, variant, largo, colorSeleccionado, telaTipo, precioFinal, cantidad]
  );

  function handleAgregar() {
    addLine({ productId: product.id, variantId, largoId, telaTipo, telaColorId, cantidad });
  }

  function handleComprarAhora() {
    handleAgregar();
    router.push("/carrito");
  }

  return (
    <div className="container-nb py-14">
      <p className="text-xs text-nb-beige/45 mb-8">
        Inicio / {product.categoria} / <span className="text-nb-beige/70">{product.nombre}</span>
      </p>

      <div className="grid md:grid-cols-2 gap-12">
        {/* GALLERY */}
        <div>
          <div className="relative aspect-[4/5] bg-nb-card border border-nb-line/50 overflow-hidden">
            <Image
              src={imagenPrincipal}
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
                    !variant?.imagen && i === activeImg ? "border-nb-champagne" : "border-nb-line/50"
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
            <span className="inline-block text-[10px] tracking-wide bg-nb-card border border-nb-line/60 text-nb-beige/50 px-2 py-1 mb-3">
              PRODUCTO DE PRUEBA
            </span>
          )}
          <h1 className="font-serif font-semibold text-3xl sm:text-4xl text-nb-cream">{product.nombre}</h1>
          <div className="mt-3 flex items-center gap-3">
            <span className="text-2xl text-nb-champagne">{formatARS(precioFinal)}</span>
            {product.precioAnterior && (
              <span className="text-nb-beige/40 line-through">{formatARS(product.precioAnterior)}</span>
            )}
          </div>
          <p className="text-sm text-nb-beige/50 mt-1">Precio pagando por transferencia</p>

          {product.mercadoPagoLink && (
            <a
              href={product.mercadoPagoLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 border border-nb-champagne/60 text-nb-champagne text-xs tracking-widest3 uppercase px-4 py-2.5 hover:bg-nb-champagne/10 transition-colors"
            >
              <CreditCard size={15} /> 6 cuotas sin interés con tarjeta
            </a>
          )}

          <p className="mt-6 text-nb-beige/70 leading-relaxed">{product.descripcion}</p>

          <div className="mt-6 grid grid-cols-3 gap-4 text-sm text-nb-beige/60 border-y border-nb-line/50 py-4">
            <div>
              <p className="text-nb-beige/35 text-xs mb-1">Medidas</p>
              {largo ? largo.cm : product.logistica.largoCm}×{product.logistica.anchoCm}×{product.logistica.altoCm} cm
            </div>
            <div>
              <p className="text-nb-beige/35 text-xs mb-1">Peso</p>
              {product.logistica.pesoKg} kg
            </div>
            <div>
              <p className="text-nb-beige/35 text-xs mb-1">Materiales</p>
              {variant?.material || "Consultar"}
            </div>
          </div>

          {product.diasFabricacion != null && product.diasFabricacion > 0 && (
            <p className="mt-4 text-sm text-nb-beige/60">
              🛠️ Este producto se fabrica a pedido — demora estimada de{" "}
              <strong className="text-nb-cream">{product.diasFabricacion} días hábiles</strong> antes
              de despacharse.
            </p>
          )}

          {product.variantes.length > 1 && (
            <div className="mt-6">
              <p className="text-[11px] tracking-widest3 uppercase text-nb-beige/45 mb-2">Color / Variante</p>
              <div className="flex flex-wrap gap-2">
                {product.variantes.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => elegirVariante(v.id)}
                    className={`px-3.5 py-2 text-sm border transition-colors ${
                      v.id === variantId
                        ? "border-nb-champagne bg-nb-champagne/10 text-nb-cream"
                        : "border-nb-line/60 text-nb-beige/70 hover:border-nb-champagne/50"
                    }`}
                  >
                    {[v.color, v.material].filter(Boolean).join(" · ")}
                    {v.priceDelta ? (
                      <span className="text-nb-champagne"> +{formatARS(v.priceDelta)}</span>
                    ) : null}
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.largos && product.largos.length > 1 && (
            <div className="mt-6">
              <p className="text-[11px] tracking-widest3 uppercase text-nb-beige/45 mb-2">Largo</p>
              <div className="flex flex-wrap gap-2">
                {product.largos.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setLargoId(m.id)}
                    className={`px-3.5 py-2 text-sm border transition-colors ${
                      m.id === largoId
                        ? "border-nb-champagne bg-nb-champagne/10 text-nb-cream"
                        : "border-nb-line/60 text-nb-beige/70 hover:border-nb-champagne/50"
                    }`}
                  >
                    {m.cm} cm
                    {m.priceDelta ? (
                      <span className="text-nb-champagne"> +{formatARS(m.priceDelta)}</span>
                    ) : null}
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.telas && product.telas.length > 0 && (
            <div className="mt-6">
              <p className="text-[11px] tracking-widest3 uppercase text-nb-beige/45 mb-2">Tapizado</p>
              <div className="flex flex-wrap gap-2">
                {product.telas.map((t) => (
                  <button
                    key={t.tipo}
                    onClick={() => abrirCatalogo(t.tipo)}
                    className="px-3.5 py-2 text-sm border border-nb-line/60 text-nb-beige/70 hover:border-nb-champagne hover:text-nb-champagne transition-colors"
                  >
                    Elegir {TELA_LABELS[t.tipo]}
                  </button>
                ))}
              </div>
              {colorSeleccionado && (
                <p className="mt-3 flex items-center gap-2 text-sm text-nb-beige/70">
                  <span
                    className="relative w-6 h-6 rounded-full border border-nb-line/70 overflow-hidden flex-shrink-0"
                    style={{ backgroundColor: colorSeleccionado.hex }}
                  >
                    {colorSeleccionado.imagen && (
                      <Image src={colorSeleccionado.imagen} alt="" fill className="object-cover" />
                    )}
                  </span>
                  {TELA_LABELS[telaTipo!]} — color {colorSeleccionado.nombre}
                </p>
              )}
            </div>
          )}

          <p className="mt-5 flex items-center gap-2 text-xs text-nb-beige/55">
            <span className={`w-2 h-2 rounded-full ${sinStock ? "bg-red-400" : "bg-green-400"}`} />
            {sinStock ? "Sin stock disponible" : "Stock disponible"}
          </p>

          <div className="mt-5 flex items-center gap-4">
            <p className="text-[11px] tracking-widest3 uppercase text-nb-beige/45">Cantidad</p>
            <div className="flex items-center border border-nb-line/60">
              <button
                onClick={() => setCantidad((q) => Math.max(1, q - 1))}
                className="p-2.5 hover:bg-nb-card transition-colors text-nb-beige"
                aria-label="Restar"
              >
                <Minus size={14} />
              </button>
              <span className="w-10 text-center text-sm text-nb-cream">{cantidad}</span>
              <button
                onClick={() => setCantidad((q) => q + 1)}
                className="p-2.5 hover:bg-nb-card transition-colors text-nb-beige"
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
              className="flex-1 py-3.5 border border-nb-beige/40 text-nb-beige text-xs tracking-widest3 uppercase hover:border-nb-champagne hover:text-nb-champagne transition-colors duration-200 disabled:opacity-40 focus-ring"
            >
              Agregar al carrito
            </button>
            <button
              onClick={handleComprarAhora}
              disabled={sinStock}
              className="flex-1 py-3.5 bg-nb-champagne text-nb-black text-xs tracking-widest3 uppercase hover:bg-nb-gold transition-colors duration-200 disabled:opacity-40 focus-ring"
            >
              Comprar ahora
            </button>
          </div>

          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-sm text-nb-beige/60 hover:text-nb-champagne transition-colors"
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

      {/* CATÁLOGO DE TELAS */}
      {catalogo && (
        <div
          className="fixed inset-0 z-50 bg-nb-ink/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={cerrarCatalogo}
        >
          <div
            className="bg-nb-black border border-nb-line/60 max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={cerrarCatalogo}
              className="absolute top-4 right-4 text-nb-beige/60 hover:text-nb-champagne transition-colors"
              aria-label="Cerrar"
            >
              <X size={20} />
            </button>
            <h3 className="font-serif text-xl text-nb-cream mb-1">
              Catálogo de {TELA_LABELS[catalogo.tipo]}
            </h3>
            <p className="text-sm text-nb-beige/55 mb-6">
              Tocá un color para verlo más grande, y confirmalo.
            </p>

            {!colorEnPreview ? (
              <div className="grid grid-cols-6 gap-3">
                {catalogo.colores.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setColorEnGrande(c.id)}
                    className="flex flex-col items-center gap-1.5"
                  >
                    <span
                      className="relative w-full aspect-square rounded-full border-2 border-nb-line/60 overflow-hidden hover:border-nb-champagne transition-colors"
                      style={{ backgroundColor: c.hex }}
                    >
                      {c.imagen && <Image src={c.imagen} alt={c.nombre} fill className="object-cover" />}
                    </span>
                    <span className="text-[11px] text-nb-beige/60">{c.nombre}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <span
                  className="relative w-48 h-48 rounded-full border-4 border-nb-line/60 overflow-hidden"
                  style={{ backgroundColor: colorEnPreview.hex }}
                >
                  {colorEnPreview.imagen && (
                    <Image src={colorEnPreview.imagen} alt={colorEnPreview.nombre} fill className="object-cover" />
                  )}
                </span>
                <p className="mt-4 text-nb-cream">
                  {TELA_LABELS[catalogo.tipo]} — color {colorEnPreview.nombre}
                </p>
                <div className="mt-6 flex gap-3 w-full">
                  <button
                    onClick={() => setColorEnGrande(null)}
                    className="flex-1 py-3 border border-nb-line/60 text-nb-beige text-xs tracking-widest3 uppercase hover:border-nb-champagne transition-colors"
                  >
                    Volver
                  </button>
                  <button
                    onClick={confirmarColorTela}
                    className="flex-1 py-3 bg-nb-champagne text-nb-black text-xs tracking-widest3 uppercase hover:bg-nb-gold transition-colors"
                  >
                    Confirmar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
