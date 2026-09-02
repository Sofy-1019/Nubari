"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { OrderStatus } from "@/lib/types";

const ESTADOS: OrderStatus[] = [
  "pendiente_pago",
  "pago_aprobado",
  "preparando",
  "despachado",
  "en_transito",
  "entregado",
  "cancelado",
];

const LABELS: Record<OrderStatus, string> = {
  pendiente_pago: "Pendiente de pago",
  pago_aprobado: "Pago aprobado",
  preparando: "Preparando",
  despachado: "Despachado",
  en_transito: "En tránsito",
  entregado: "Entregado",
  cancelado: "Cancelado",
};

export default function OrderStatusSelect({
  orderId,
  estado,
}: {
  orderId: string;
  estado: OrderStatus;
}) {
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
      className="text-xs border border-nb-black/20 px-2 py-1.5 bg-white"
    >
      {ESTADOS.map((e) => (
        <option key={e} value={e}>{LABELS[e]}</option>
      ))}
    </select>
  );
}
