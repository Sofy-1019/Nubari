import type {
  CarrierId,
  Destino,
  Product,
  ShippingBranch,
  ShippingQuoteOption,
} from "../types";

export interface QuoteRequestPackage {
  pesoKg: number;
  altoCm: number;
  anchoCm: number;
  largoCm: number;
  valorDeclarado: number;
}

export interface QuoteRequest {
  origen: {
    codigoPostal: string;
    localidad: string;
    provincia: string;
  };
  destino: Destino;
  bultos: QuoteRequestPackage[];
}

export interface CreateShipmentRequest extends QuoteRequest {
  orderId: string;
  cliente: {
    nombre: string;
    apellido: string;
    telefono: string;
    email: string;
  };
  modoSeleccionado: "domicilio" | "sucursal";
  sucursalId?: string;
}

export interface CreateShipmentResult {
  shipmentId: string;
  trackingId?: string;
  labelUrl?: string;
}

export interface TrackingEvent {
  fecha: string;
  estado: string;
  detalle?: string;
}

/**
 * Contrato que debe implementar cada transportista.
 *
 * No todos los métodos necesitan estar "activos" desde el día uno: si la
 * credencial/API todavía no está conectada, el método debe lanzar
 * `ShippingProviderUnavailableError` para que la capa superior lo capture
 * y ofrezca un fallback, en vez de romper la tienda.
 */
export interface ShippingProvider {
  readonly id: CarrierId;
  readonly label: string;

  getQuote(req: QuoteRequest): Promise<ShippingQuoteOption[]>;
  getBranches(destino: Destino): Promise<ShippingBranch[]>;
  getNearestBranch(destino: Destino): Promise<ShippingBranch | null>;
  createShipment(req: CreateShipmentRequest): Promise<CreateShipmentResult>;
  getTracking(trackingId: string): Promise<TrackingEvent[]>;
}

export class ShippingProviderUnavailableError extends Error {
  constructor(public carrier: CarrierId, reason: string) {
    super(reason);
    this.name = "ShippingProviderUnavailableError";
  }
}

export function packagesFromProduct(
  product: Product,
  cantidad: number
): QuoteRequestPackage[] {
  const { logistica } = product;
  const bultosBase =
    logistica.detalleBultos && logistica.detalleBultos.length > 0
      ? logistica.detalleBultos
      : Array.from({ length: logistica.bultos }, () => ({
          pesoKg: logistica.pesoKg / logistica.bultos,
          altoCm: logistica.altoCm,
          anchoCm: logistica.anchoCm,
          largoCm: logistica.largoCm,
        }));

  const paquetesUnaUnidad = bultosBase.map((b) => ({
    ...b,
    valorDeclarado: logistica.valorDeclarado / logistica.bultos,
  }));

  // Repite los bultos por la cantidad comprada.
  const resultado: QuoteRequestPackage[] = [];
  for (let i = 0; i < cantidad; i++) {
    resultado.push(...paquetesUnaUnidad);
  }
  return resultado;
}
