"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { CartLine, ShippingQuoteOption } from "./types";

const STORAGE_KEY = "nubari_cart_v1";

interface CartContextValue {
  lines: CartLine[];
  addLine: (line: CartLine) => void;
  updateQuantity: (productId: string, variantId: string | undefined, cantidad: number) => void;
  removeLine: (productId: string, variantId?: string) => void;
  clearCart: () => void;
  selectedShipping: ShippingQuoteOption | null;
  setSelectedShipping: (opt: ShippingQuoteOption | null) => void;
  destino: { codigoPostal: string } | null;
  setDestino: (d: { codigoPostal: string } | null) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<ShippingQuoteOption | null>(null);
  const [destino, setDestino] = useState<{ codigoPostal: string } | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setLines(parsed.lines ?? []);
        setSelectedShipping(parsed.selectedShipping ?? null);
        setDestino(parsed.destino ?? null);
      }
    } catch {
      // localStorage no disponible o dato corrupto: se ignora y arranca vacío
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ lines, selectedShipping, destino })
    );
  }, [lines, selectedShipping, destino, hydrated]);

  const addLine = useCallback((line: CartLine) => {
    setSelectedShipping(null); // el envío se recalcula si cambia el carrito
    setLines((prev) => {
      const idx = prev.findIndex(
        (l) => l.productId === line.productId && l.variantId === line.variantId
      );
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], cantidad: next[idx].cantidad + line.cantidad };
        return next;
      }
      return [...prev, line];
    });
  }, []);

  const updateQuantity = useCallback(
    (productId: string, variantId: string | undefined, cantidad: number) => {
      setSelectedShipping(null);
      setLines((prev) =>
        prev
          .map((l) =>
            l.productId === productId && l.variantId === variantId
              ? { ...l, cantidad: Math.max(1, cantidad) }
              : l
          )
      );
    },
    []
  );

  const removeLine = useCallback((productId: string, variantId?: string) => {
    setSelectedShipping(null);
    setLines((prev) =>
      prev.filter((l) => !(l.productId === productId && l.variantId === variantId))
    );
  }, []);

  const clearCart = useCallback(() => {
    setLines([]);
    setSelectedShipping(null);
    setDestino(null);
  }, []);

  const value = useMemo(
    () => ({
      lines,
      addLine,
      updateQuantity,
      removeLine,
      clearCart,
      selectedShipping,
      setSelectedShipping,
      destino,
      setDestino,
    }),
    [lines, addLine, updateQuantity, removeLine, clearCart, selectedShipping, destino]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de <CartProvider>");
  return ctx;
}
