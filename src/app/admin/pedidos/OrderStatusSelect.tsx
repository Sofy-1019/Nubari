"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { OrderStatus } from "@/lib/types";

const ESTADOS: OrderStatus[] = ["pendiente_pago", "pago_aprobado", "preparando", "despachado", "en_transito", "entregado", "cancelado"];

const LABELS: Record<OrderStatus, string> = {
  pendiente_pago: "Pendiente de pago",
  pago_aprobado: "Pago aprobado",
  preparando: "Preparando",
  despachado: "Despachado",
  en_transito: "En tránsito",
  entregado: "Entregado",
  cancelado: "Cancelado",
};

export default function OrderStatusSelect({ orderId, estado }: { orderId: string; estado: OrderStatus }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function handleChange(next: OrderStatus) {
    setSaving(true);
    try {
      await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: next }),
      });
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <select
      value={estado}
      disabled={saving}
      onChange={(e) => handleChange(e.target.value as OrderStatus)}
      className="text-sm border border-nb-line/60 px-3 py-2 bg-nb-black/50 text-nb-cream"
    >
      {ESTADOS.map((e) => (
        <option key={e} value={e}>{LABELS[e]}</option>
      ))}
    </select>
  );
}
