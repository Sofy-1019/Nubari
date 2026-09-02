// ==========================================================================
// NUBARI — Tipos centrales del dominio
// ==========================================================================

export type ProductCategory =
  | "banquetas"
  | "organizacion"
  | "cocina"
  | "hogar"
  | "oficina"
  | "novedades";

export interface ProductVariant {
  id: string;
  color?: string;
  material?: string;
  medida?: string;
  skuSuffix?: string;
  stock: number;
  priceDelta?: number; // ajuste opcional sobre el precio base
}

// Datos logísticos del producto COMPLETO (tal como se despacha, 1 o más bultos)
export interface ProductLogistics {
  pesoKg: number;
  altoCm: number;
  anchoCm: number;
  largoCm: number;
  bultos: number;
  // Si el producto se despacha en más de un bulto, se puede detallar cada uno.
  // Si no se especifica, se asume que todos los bultos son iguales a las
  // medidas/peso de arriba divididas por la cantidad de bultos.
  detalleBultos?: {
    pesoKg: number;
    altoCm: number;
    anchoCm: number;
    largoCm: number;
  }[];
  valorDeclarado: number;
  // Regla logística: qué transportistas pueden manejar este producto.
  // Se configura por producto o se hereda de la config global (ver shipping-rules.json)
  transportistasPermitidos?: ("andreani" | "via-cargo")[];
  requiereCotizacionManual?: boolean; // producto fuera de límites -> "Solicitar cotización"
}

export interface Product {
  id: string;
  slug: string;
  nombre: string;
  descripcion: string;
  categoria: ProductCategory;
  precio: number;
  precioAnterior?: number;
  costo?: number;
  sku: string;
  stock: number;
  destacado: boolean;
  nuevo: boolean;
  agotado: boolean;
  activo: boolean;
  esProductoDePrueba?: boolean;
  diasFabricacion?: number; // demora estimada de fabricación, en días hábiles
  imagenes: string[]; // rutas/URLs, en orden de exhibición
  variantes: ProductVariant[];
  logistica: ProductLogistics;
  creadoEn: string;
  actualizadoEn: string;
}

export interface CartLine {
  productId: string;
  variantId?: string;
  cantidad: number;
}

export interface Destino {
  codigoPostal: string;
  direccion?: string;
  numero?: string;
  localidad?: string;
  provincia?: string;
}

export type CarrierId = "andreani" | "via-cargo";
export type ShippingMode = "domicilio" | "sucursal";

export interface ShippingBranch {
  id: string;
  nombre: string;
  direccion: string;
  distanciaKm?: number;
}

export interface ShippingQuoteOption {
  carrier: CarrierId;
  carrierLabel: string;
  mode: ShippingMode;
  modeLabel: string;
  price: number;
  currency: "ARS";
  etaDias?: [number, number];
  estimado: true; // siempre true salvo que el proveedor garantice el precio
  branch?: ShippingBranch;
  raw?: unknown;
}

export interface ShippingQuoteResult {
  destino: Destino;
  opciones: ShippingQuoteOption[];
  errores: { carrier: CarrierId; motivo: string }[];
}

export interface OrderItem {
  productId: string;
  productName: string;
  variantId?: string;
  variantLabel?: string;
  cantidad: number;
  precioUnitario: number;
  imagen?: string;
}

export type OrderStatus =
  | "pendiente_pago"
  | "pago_aprobado"
  | "preparando"
  | "despachado"
  | "en_transito"
  | "entregado"
  | "cancelado";

export interface Order {
  id: string;
  numero: string;
  cliente: {
    nombre: string;
    apellido: string;
    email: string;
    telefono: string;
    direccion: string;
    numero: string;
    pisoDepto?: string;
    localidad: string;
    provincia: string;
    codigoPostal: string;
  };
  items: OrderItem[];
  subtotal: number;
  envio: {
    carrier: CarrierId;
    mode: ShippingMode;
    price: number;
    label: string;
  } | null;
  total: number;
  estado: OrderStatus;
  metodoPago: "mercado_pago" | "pendiente";
  trackingId?: string;
  creadoEn: string;
}

export interface CarrierConfig {
  id: CarrierId;
  nombre: string;
  activo: boolean;
  usaApiReal: boolean; // false = usando datos mock
  limitePesoKg?: number;
  limiteVolumenM3?: number;
  categoriasPermitidas?: ProductCategory[] | "todas";
}
