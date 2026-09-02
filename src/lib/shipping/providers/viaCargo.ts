import type { ShippingBranch, ShippingQuoteOption } from "../../types";
import {
  CreateShipmentRequest,
  CreateShipmentResult,
  QuoteRequest,
  ShippingProvider,
  ShippingProviderUnavailableError,
  TrackingEvent,
} from "../types";

// ==========================================================================
// ViaCargoProvider
//
// Vía Cargo no publica una API pública unificada como Andreani; el acceso
// depende del convenio comercial de cada cliente. Esta clase deja la capa
// de integración lista: en cuanto Nubari tenga credenciales/endpoint
// provistos por Vía Cargo, completar VIACARGO_API_URL y VIACARGO_API_KEY
// en .env y ajustar `mapViaCargoResponse` al formato real.
//
// Mientras tanto, se usa una cotización MOCK que sí respeta las 4
// modalidades reales del servicio (agencia-agencia, agencia-domicilio,
// domicilio-agencia, domicilio-domicilio), para que el frontend/checkout
// quede completamente preparado.
// ==========================================================================

function isConfigured() {
  return Boolean(process.env.VIACARGO_API_URL && process.env.VIACARGO_API_KEY);
}

export const ViaCargoProvider: ShippingProvider = {
  id: "via-cargo",
  label: "Vía Cargo",

  async getQuote(req: QuoteRequest): Promise<ShippingQuoteOption[]> {
    if (!isConfigured()) {
      return mockQuote(req);
    }

    try {
      const res = await fetch(`${process.env.VIACARGO_API_URL}/cotizar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.VIACARGO_API_KEY}`,
        },
        body: JSON.stringify({
          origen_postal: req.origen.codigoPostal,
          destino_postal: req.destino.codigoPostal,
          bultos: req.bultos,
        }),
        signal: AbortSignal.timeout(8000),
      });

      if (!res.ok) {
        throw new ShippingProviderUnavailableError(
          "via-cargo",
          `Vía Cargo respondió ${res.status}`
        );
      }

      const data = await res.json();
      return mapViaCargoResponse(data);
    } catch (err) {
      if (err instanceof ShippingProviderUnavailableError) throw err;
      throw new ShippingProviderUnavailableError(
        "via-cargo",
        `No se pudo consultar Vía Cargo: ${(err as Error).message}`
      );
    }
  },

  async getBranches(destino): Promise<ShippingBranch[]> {
    if (!isConfigured()) return mockBranches(destino.codigoPostal);
    throw new ShippingProviderUnavailableError(
      "via-cargo",
      "Listado real de agencias aún no implementado"
    );
  },

  async getNearestBranch(destino): Promise<ShippingBranch | null> {
    const branches = await this.getBranches(destino).catch(() =>
      mockBranches(destino.codigoPostal)
    );
    return branches[0] ?? null;
  },

  async createShipment(_req: CreateShipmentRequest): Promise<CreateShipmentResult> {
    if (!isConfigured()) return { shipmentId: `MOCK-VC-${Date.now()}` };
    throw new ShippingProviderUnavailableError(
      "via-cargo",
      "Creación de envío real aún no implementada"
    );
  },

  async getTracking(_trackingId: string): Promise<TrackingEvent[]> {
    if (!isConfigured()) return [];
    throw new ShippingProviderUnavailableError(
      "via-cargo",
      "Tracking real aún no implementado"
    );
  },
};

function mapViaCargoResponse(data: any): ShippingQuoteOption[] {
  const opciones = Array.isArray(data?.opciones) ? data.opciones : [];
  return opciones.map((o: any) => ({
    carrier: "via-cargo" as const,
    carrierLabel: "Vía Cargo",
    mode: o.modalidad?.includes("domicilio_destino") ? ("domicilio" as const) : ("sucursal" as const),
    modeLabel: describeModalidad(o.modalidad),
    price: Number(o.precio ?? 0),
    currency: "ARS" as const,
    estimado: true as const,
    raw: o,
  }));
}

function describeModalidad(modalidad: string): string {
  const map: Record<string, string> = {
    agencia_agencia: "Agencia → Agencia",
    agencia_domicilio: "Agencia → Domicilio",
    domicilio_agencia: "Domicilio → Agencia",
    domicilio_domicilio: "Domicilio → Domicilio",
  };
  return map[modalidad] ?? modalidad;
}

// -------------------- MOCK (solo para desarrollo) --------------------

function mockQuote(req: QuoteRequest): ShippingQuoteOption[] {
  const pesoTotal = req.bultos.reduce((acc, b) => acc + b.pesoKg, 0);
  const volumenTotal = req.bultos.reduce(
    (acc, b) => acc + (b.altoCm * b.anchoCm * b.largoCm) / 1_000_000,
    0
  );
  const base = 3600 + pesoTotal * 340 + volumenTotal * 8200;
  const distanciaFactor = estimarFactorDistancia(req.destino.codigoPostal);

  const agencia = Math.round((base * distanciaFactor) / 10) * 10;
  const domicilio = Math.round((base * 1.28 * distanciaFactor) / 10) * 10;

  return [
    {
      carrier: "via-cargo",
      carrierLabel: "Vía Cargo",
      mode: "domicilio",
      modeLabel: "Entrega a domicilio",
      price: domicilio,
      currency: "ARS",
      etaDias: [3, 6],
      estimado: true,
    },
    {
      carrier: "via-cargo",
      carrierLabel: "Vía Cargo",
      mode: "sucursal",
      modeLabel: "Agencia más cercana",
      price: agencia,
      currency: "ARS",
      etaDias: [2, 5],
      estimado: true,
      branch: mockBranches(req.destino.codigoPostal)[0],
    },
  ];
}

function mockBranches(codigoPostal: string): ShippingBranch[] {
  return [
    {
      id: `vc-${codigoPostal}-1`,
      nombre: `Vía Cargo · Agencia ${codigoPostal}`,
      direccion: "Dirección referencial — pendiente de API/convenio real",
      distanciaKm: 3.1,
    },
  ];
}

function estimarFactorDistancia(codigoPostal: string): number {
  const cp = parseInt(codigoPostal, 10);
  if (Number.isNaN(cp)) return 1.2;
  if (cp >= 1000 && cp <= 1900) return 1;
  if (cp >= 2000 && cp <= 3000) return 1.25;
  if (cp >= 5000 && cp <= 5999) return 1.45;
  return 1.7;
}
