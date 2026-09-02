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
// AndreaniProvider
//
// Implementa el contrato ShippingProvider contra la API oficial de Andreani.
//
// ESTADO ACTUAL: sin credenciales reales configuradas -> usa cotización MOCK
// (ver `mockQuote`) para que la tienda sea totalmente navegable en
// desarrollo. En cuanto existan las variables de entorno
// ANDREANI_API_URL / ANDREANI_API_KEY / ANDREANI_CONTRATO / ANDREANI_CLIENTE,
// automáticamente empieza a intentar la llamada real (ver `isConfigured`).
//
// Para activar la integración real:
//   1. Solicitar acceso a la API de Andreani (https://developers.andreani.com)
//   2. Completar ANDREANI_API_URL, ANDREANI_API_KEY, ANDREANI_CONTRATO,
//      ANDREANI_CLIENTE en el archivo .env (NUNCA en el frontend)
//   3. Ajustar el mapeo de la respuesta en `mapAndreaniResponse` según el
//      formato real que devuelva la API contratada (puede variar según el
//      tipo de contrato/endpoint asignado por Andreani).
// ==========================================================================

function isConfigured() {
  return Boolean(
    process.env.ANDREANI_API_URL &&
      process.env.ANDREANI_API_KEY &&
      process.env.ANDREANI_CLIENTE
  );
}

export const AndreaniProvider: ShippingProvider = {
  id: "andreani",
  label: "Andreani",

  async getQuote(req: QuoteRequest): Promise<ShippingQuoteOption[]> {
    if (!isConfigured()) {
      return mockQuote(req);
    }

    try {
      const pesoTotal = req.bultos.reduce((acc, b) => acc + b.pesoKg, 0);
      const volumenTotal = req.bultos.reduce(
        (acc, b) => acc + (b.altoCm * b.anchoCm * b.largoCm) / 1_000_000,
        0
      );
      const valorDeclaradoTotal = req.bultos.reduce(
        (acc, b) => acc + b.valorDeclarado,
        0
      );

      const res = await fetch(`${process.env.ANDREANI_API_URL}/v2/tarifas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-authorization-token": process.env.ANDREANI_API_KEY!,
        },
        body: JSON.stringify({
          cliente: process.env.ANDREANI_CLIENTE,
          contrato: process.env.ANDREANI_CONTRATO,
          origen: { postal: req.origen.codigoPostal },
          destino: { postal: req.destino.codigoPostal },
          bultos: req.bultos.map((b) => ({
            kilos: b.pesoKg,
            alto: b.altoCm,
            ancho: b.anchoCm,
            largo: b.largoCm,
            valorDeclarado: b.valorDeclarado,
          })),
          pesoTotal,
          volumenTotal,
          valorDeclaradoTotal,
        }),
        // Evita que un proveedor caído cuelgue el checkout.
        signal: AbortSignal.timeout(8000),
      });

      if (!res.ok) {
        throw new ShippingProviderUnavailableError(
          "andreani",
          `Andreani respondió ${res.status}`
        );
      }

      const data = await res.json();
      return mapAndreaniResponse(data);
    } catch (err) {
      if (err instanceof ShippingProviderUnavailableError) throw err;
      throw new ShippingProviderUnavailableError(
        "andreani",
        `No se pudo consultar Andreani: ${(err as Error).message}`
      );
    }
  },

  async getBranches(destino): Promise<ShippingBranch[]> {
    if (!isConfigured()) return mockBranches(destino.codigoPostal);
    // TODO: reemplazar por GET /v2/sucursales?postal=... cuando se conecten
    // las credenciales reales. Formato exacto según documentación de Andreani.
    throw new ShippingProviderUnavailableError(
      "andreani",
      "Listado real de sucursales aún no implementado"
    );
  },

  async getNearestBranch(destino): Promise<ShippingBranch | null> {
    const branches = await this.getBranches(destino).catch(() => mockBranches(destino.codigoPostal));
    return branches[0] ?? null;
  },

  async createShipment(_req: CreateShipmentRequest): Promise<CreateShipmentResult> {
    if (!isConfigured()) {
      return { shipmentId: `MOCK-AND-${Date.now()}` };
    }
    // TODO: POST /v2/ordenes-de-envio según documentación oficial.
    throw new ShippingProviderUnavailableError(
      "andreani",
      "Creación de envío real aún no implementada"
    );
  },

  async getTracking(_trackingId: string): Promise<TrackingEvent[]> {
    if (!isConfigured()) return [];
    // TODO: GET /v2/envios/{trackingId}/trazas
    throw new ShippingProviderUnavailableError(
      "andreani",
      "Tracking real aún no implementado"
    );
  },
};

function mapAndreaniResponse(data: any): ShippingQuoteOption[] {
  // Este mapeo es un placeholder razonable; debe ajustarse al payload real
  // que devuelva el contrato de Andreani una vez conectado.
  const tarifas = Array.isArray(data?.tarifas) ? data.tarifas : [];
  return tarifas.map((t: any) => ({
    carrier: "andreani" as const,
    carrierLabel: "Andreani",
    mode: t.tipoEntrega === "sucursal" ? ("sucursal" as const) : ("domicilio" as const),
    modeLabel: t.tipoEntrega === "sucursal" ? "Retiro en sucursal" : "Entrega a domicilio",
    price: Number(t.precio ?? 0),
    currency: "ARS" as const,
    etaDias: t.diasEntrega ? [t.diasEntrega, t.diasEntrega + 1] : undefined,
    estimado: true as const,
    raw: t,
  }));
}

// -------------------- MOCK (solo para desarrollo) --------------------

function mockQuote(req: QuoteRequest): ShippingQuoteOption[] {
  const pesoTotal = req.bultos.reduce((acc, b) => acc + b.pesoKg, 0);
  const volumenTotal = req.bultos.reduce(
    (acc, b) => acc + (b.altoCm * b.anchoCm * b.largoCm) / 1_000_000,
    0
  );
  const base = 4200 + pesoTotal * 380 + volumenTotal * 9000;
  const distanciaFactor = estimarFactorDistancia(req.destino.codigoPostal);

  const domicilio = Math.round((base * 1.35 * distanciaFactor) / 10) * 10;
  const sucursal = Math.round((base * distanciaFactor) / 10) * 10;

  return [
    {
      carrier: "andreani",
      carrierLabel: "Andreani",
      mode: "domicilio",
      modeLabel: "Entrega a domicilio",
      price: domicilio,
      currency: "ARS",
      etaDias: [2, 4],
      estimado: true,
    },
    {
      carrier: "andreani",
      carrierLabel: "Andreani",
      mode: "sucursal",
      modeLabel: "Retiro en sucursal",
      price: sucursal,
      currency: "ARS",
      etaDias: [1, 3],
      estimado: true,
      branch: mockBranches(req.destino.codigoPostal)[0],
    },
  ];
}

function mockBranches(codigoPostal: string): ShippingBranch[] {
  // Sucursales de ejemplo — SOLO para que la interfaz sea navegable en
  // desarrollo. En producción, este listado debe venir de la API real.
  return [
    {
      id: `and-${codigoPostal}-1`,
      nombre: `Andreani · Sucursal ${codigoPostal}`,
      direccion: "Dirección referencial — pendiente de API real",
      distanciaKm: 2.4,
    },
  ];
}

function estimarFactorDistancia(codigoPostal: string): number {
  const cp = parseInt(codigoPostal, 10);
  if (Number.isNaN(cp)) return 1.2;
  // Heurística grosera solo para que el mock varíe según destino;
  // no debe usarse como tarifa real.
  if (cp >= 1000 && cp <= 1900) return 1; // AMBA
  if (cp >= 2000 && cp <= 3000) return 1.3; // Santa Fe / Rosario
  if (cp >= 5000 && cp <= 5999) return 1.5; // Córdoba/Cuyo
  return 1.8; // resto del país
}
