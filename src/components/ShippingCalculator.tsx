"use client";

import { useState } from "react";
import { Loader2, MapPin, Package, Store } from "lucide-react";
import { formatARS } from "@/lib/utils";
import type { CartLine, Destino, ShippingQuoteOption, ShippingQuoteResult } from "@/lib/types";
import { useCart } from "@/lib/cartContext";

interface Props {
  lines: CartLine[];
  onSelect?: (opt: ShippingQuoteOption) => void;
  compact?: boolean;
}

// ==========================================================================
// El cotizador SIEMPRE pide dirección completa + código postal juntos.
// No hay pestañas ni una opción de cotizar solo con CP: la dirección
// completa es la que permite luego ubicar la agencia/sucursal más cercana.
// ==========================================================================

const CAMPOS: { key: keyof FormFields; label: string; placeholder: string }[] = [
  { key: "direccion", label: "Dirección", placeholder: "Av. Corrientes" },
  { key: "numero", label: "Número", placeholder: "1234" },
  { key: "localidad", label: "Localidad", placeholder: "Berazategui" },
  { key: "provincia", label: "Provincia", placeholder: "Buenos Aires" },
  { key: "codigoPostal", label: "Código postal", placeholder: "1884" },
];

interface FormFields {
  direccion: string;
  numero: string;
  localidad: string;
  provincia: string;
  codigoPostal: string;
}

export default function ShippingCalculator({ lines, onSelect, compact }: Props) {
  const { setSelectedShipping, setDestino, setDireccion, direccion } = useCart();
  const [form, setForm] = useState<FormFields>(
    direccion || { direccion: "", numero: "", localidad: "", provincia: "", codigoPostal: "" }
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ShippingQuoteResult | null>(null);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function set(key: keyof FormFields, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function validar(): string | null {
    if (!form.direccion.trim()) return "Completá tu dirección.";
    if (!form.numero.trim()) return "Completá el número.";
    if (!form.localidad.trim()) return "Completá tu localidad.";
    if (!form.provincia.trim()) return "Completá tu provincia.";
    if (!form.codigoPostal.trim()) return "Completá tu código postal.";
    return null;
  }

  async function handleCalcular(e: React.FormEvent) {
    e.preventDefault();
    const problema = validar();
    if (problema) {
      setError(problema);
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const destino: Destino = {
        direccion: form.direccion.trim(),
        numero: form.numero.trim(),
        localidad: form.localidad.trim(),
        provincia: form.provincia.trim(),
        codigoPostal: form.codigoPostal.trim(),
      };
      const res = await fetch("/api/shipping/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lines, destino }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo calcular el envío.");
        return;
      }
      setResult(data);
      setDestino({ codigoPostal: form.codigoPostal.trim() });
      setDireccion(form);
    } catch {
      setError("No se pudo calcular el envío. Intentá nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  function handleElegir(opt: ShippingQuoteOption) {
    const key = `${opt.carrier}-${opt.mode}`;
    setSelectedKey(key);
    setSelectedShipping(opt);
    onSelect?.(opt);
  }

  return (
    <div className="border border-nb-line/60 bg-nb-card p-5 sm:p-6">
      {!compact && (
        <>
          <p className="text-sm text-nb-cream mb-1">Calculá tu envío</p>
          <p className="text-xs text-nb-beige/55 mb-4">
            Completá tu dirección y código postal para conocer las opciones disponibles.
          </p>
        </>
      )}
      <form onSubmit={handleCalcular} className="grid sm:grid-cols-2 gap-3">
        {CAMPOS.map((c) => (
          <div key={c.key} className={c.key === "direccion" ? "sm:col-span-2" : ""}>
            <label className="block text-[11px] tracking-wide text-nb-beige/55 mb-1">
              {c.label} *
            </label>
            <div className="relative">
              {c.key === "direccion" && (
                <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-nb-beige/40" />
              )}
              <input
                value={form[c.key]}
                onChange={(e) => set(c.key, e.target.value)}
                placeholder={c.placeholder}
                className={`w-full ${
                  c.key === "direccion" ? "pl-9" : "pl-3"
                } pr-3 py-2.5 bg-nb-black/40 border border-nb-line/60 text-nb-cream text-sm placeholder:text-nb-beige/30 focus-ring focus:border-nb-champagne outline-none`}
              />
            </div>
          </div>
        ))}
        <button
          type="submit"
          disabled={loading}
          className="sm:col-span-2 mt-1 px-5 py-3 bg-nb-champagne text-nb-black text-xs tracking-widest3 uppercase hover:bg-nb-gold transition-colors disabled:opacity-50 focus-ring flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : "Calcular envío"}
        </button>
      </form>

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

      {result && (
        <div className="mt-5">
          {result.destino.codigoPostal && (
            <p className="text-xs text-nb-beige/55 mb-3">
              📍 Envíos disponibles para {form.localidad}, {form.provincia} (CP {result.destino.codigoPostal})
            </p>
          )}

          {result.opciones.length === 0 && result.errores.length > 0 && (
            <p className="text-sm text-nb-beige/60">{result.errores[0].motivo}</p>
          )}

          <div className="space-y-2">
            {result.opciones.map((opt) => {
              const key = `${opt.carrier}-${opt.mode}`;
              const active = selectedKey === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleElegir(opt)}
                  className={`w-full flex items-center justify-between gap-3 border px-4 py-3 text-left transition-colors duration-150 focus-ring ${
                    active
                      ? "border-nb-champagne bg-nb-champagne/10"
                      : "border-nb-line/60 hover:border-nb-champagne/50"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    {opt.mode === "sucursal" ? (
                      <Store size={17} className="text-nb-champagne" />
                    ) : (
                      <Package size={17} className="text-nb-champagne" />
                    )}
                    <span>
                      <span className="block text-sm text-nb-cream">
                        {opt.carrierLabel} · {opt.modeLabel}
                      </span>
                      {opt.branch && (
                        <span className="block text-xs text-nb-beige/50">
                          {opt.branch.nombre}
                          {opt.branch.distanciaKm ? ` · ${opt.branch.distanciaKm} km` : ""}
                        </span>
                      )}
                      {opt.etaDias && (
                        <span className="block text-xs text-nb-beige/50">
                          {opt.etaDias[0]}–{opt.etaDias[1]} días hábiles
                        </span>
                      )}
                    </span>
                  </span>
                  <span className="text-sm font-medium text-nb-champagne whitespace-nowrap">
                    {formatARS(opt.price)}
                  </span>
                </button>
              );
            })}
          </div>

          {result.errores.length > 0 && result.opciones.length > 0 && (
            <p className="mt-3 text-xs text-nb-beige/40">
              {result.errores.map((e) => e.motivo).join(" ")}
            </p>
          )}

          {result.opciones.length > 0 && (
            <p className="mt-3 text-xs text-nb-beige/40">
              Precio de envío estimado. El costo final puede variar según las condiciones
              reales del transportista, peso/medidas verificadas y otros cargos.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
