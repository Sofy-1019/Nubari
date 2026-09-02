"use client";

import { useState } from "react";
import { Loader2, MapPin, Package, Store } from "lucide-react";
import { formatARS } from "@/lib/utils";
import type { CartLine, ShippingQuoteOption, ShippingQuoteResult } from "@/lib/types";
import { useCart } from "@/lib/cartContext";

interface Props {
  lines: CartLine[];
  onSelect?: (opt: ShippingQuoteOption) => void;
  compact?: boolean;
}

export default function ShippingCalculator({ lines, onSelect, compact }: Props) {
  const { setSelectedShipping, setDestino, destino } = useCart();
  const [cp, setCp] = useState(destino?.codigoPostal || "");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ShippingQuoteResult | null>(null);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCalcular(e: React.FormEvent) {
    e.preventDefault();
    if (!cp.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/shipping/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lines, destino: { codigoPostal: cp.trim() } }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo calcular el envío.");
        return;
      }
      setResult(data);
      setDestino({ codigoPostal: cp.trim() });
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
    <div className="border border-nb-black/10 p-5 sm:p-6 bg-nb-bone">
      {!compact && <p className="text-sm text-nb-ink mb-3">¿Dónde querés recibirlo?</p>}
      <form onSubmit={handleCalcular} className="flex gap-2">
        <div className="relative flex-1">
          <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-nb-taupe" />
          <input
            value={cp}
            onChange={(e) => setCp(e.target.value)}
            placeholder="Código postal"
            className="w-full pl-9 pr-3 py-2.5 border border-nb-black/20 bg-white text-sm focus-ring focus:border-nb-wood outline-none"
            inputMode="numeric"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 bg-nb-black text-nb-bone text-xs tracking-wide hover:bg-nb-ink transition-colors disabled:opacity-50 focus-ring"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : "CALCULAR ENVÍO"}
        </button>
      </form>

      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}

      {result && (
        <div className="mt-5">
          {result.destino.codigoPostal && (
            <p className="text-xs text-nb-stone mb-3">
              📍 Envío estimado a CP {result.destino.codigoPostal}
            </p>
          )}

          {result.opciones.length === 0 && result.errores.length > 0 && (
            <p className="text-sm text-nb-stone">{result.errores[0].motivo}</p>
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
                    active ? "border-nb-wood bg-nb-sand/60" : "border-nb-black/15 hover:border-nb-black/40"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    {opt.mode === "sucursal" ? (
                      <Store size={17} className="text-nb-wood" />
                    ) : (
                      <Package size={17} className="text-nb-wood" />
                    )}
                    <span>
                      <span className="block text-sm text-nb-black">
                        {opt.carrierLabel} · {opt.modeLabel}
                      </span>
                      {opt.branch && (
                        <span className="block text-xs text-nb-stone">
                          {opt.branch.nombre}
                          {opt.branch.distanciaKm ? ` · ${opt.branch.distanciaKm} km` : ""}
                        </span>
                      )}
                      {opt.etaDias && (
                        <span className="block text-xs text-nb-stone">
                          {opt.etaDias[0]}–{opt.etaDias[1]} días hábiles
                        </span>
                      )}
                    </span>
                  </span>
                  <span className="text-sm font-medium text-nb-black whitespace-nowrap">
                    {formatARS(opt.price)}
                  </span>
                </button>
              );
            })}
          </div>

          {result.errores.length > 0 && result.opciones.length > 0 && (
            <p className="mt-3 text-xs text-nb-taupe">
              {result.errores.map((e) => e.motivo).join(" ")}
            </p>
          )}

          {result.opciones.length > 0 && (
            <p className="mt-3 text-xs text-nb-taupe">
              Precio de envío estimado. El costo final puede variar según las condiciones
              reales del transportista, peso/medidas verificadas y otros cargos.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
