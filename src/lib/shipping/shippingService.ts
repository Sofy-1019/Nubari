import fs from "fs";
import path from "path";
import type { CarrierConfig, CartLine, Destino, Product, ShippingQuoteResult } from "../types";
import { AndreaniProvider } from "./providers/andreani";
import { ViaCargoProvider } from "./providers/viaCargo";
import { NUBARI_ORIGIN } from "./origin";
import { packagesFromProduct, ShippingProvider, ShippingProviderUnavailableError } from "./types";

const PROVIDERS: ShippingProvider[] = [AndreaniProvider, ViaCargoProvider];

function getCarrierConfig(): CarrierConfig[] {
  const file = path.join(process.cwd(), "data", "shipping-rules.json");
  const raw = fs.readFileSync(file, "utf-8");
  return JSON.parse(raw).carriers as CarrierConfig[];
}

interface QuoteForCartParams {
  items: { product: Product; cantidad: number }[];
  destino: Destino;
}

/**
 * Calcula el peso/volumen/valor total del carrito y determina, según las
 * reglas configuradas en shipping-rules.json y en cada producto, qué
 * transportistas pueden cotizar este envío. Luego consulta cada uno en
 * paralelo y agrega los resultados. Si un proveedor falla, no rompe la
 * cotización: se reporta en `errores` y se sigue con el resto.
 */
export async function quoteShippingForCart(
  params: QuoteForCartParams
): Promise<ShippingQuoteResult> {
  const { items, destino } = params;
  const config = getCarrierConfig();

  const bultos = items.flatMap(({ product, cantidad }) =>
    packagesFromProduct(product, cantidad)
  );

  const pesoTotal = bultos.reduce((acc, b) => acc + b.pesoKg, 0);
  const volumenTotal = bultos.reduce(
    (acc, b) => acc + (b.altoCm * b.anchoCm * b.largoCm) / 1_000_000,
    0
  );

  // Un producto puede forzar cotización manual (ej. muebles muy grandes) o
  // restringir qué transportistas lo pueden llevar.
  const requiereCotizacionManual = items.some(
    ({ product }) => product.logistica.requiereCotizacionManual
  );

  if (requiereCotizacionManual) {
    return {
      destino,
      opciones: [],
      errores: [
        {
          carrier: "andreani",
          motivo:
            "Uno o más productos requieren cotización manual por sus dimensiones. Consultanos por WhatsApp.",
        },
      ],
    };
  }

  const transportistasPermitidosPorProducto = items
    .map(({ product }) => product.logistica.transportistasPermitidos)
    .filter((t): t is ("andreani" | "via-cargo")[] => Boolean(t));

  const proveedoresElegibles = PROVIDERS.filter((provider) => {
    const carrierCfg = config.find((c) => c.id === provider.id);
    if (!carrierCfg || !carrierCfg.activo) return false;

    if (carrierCfg.limitePesoKg && pesoTotal > carrierCfg.limitePesoKg) return false;
    if (carrierCfg.limiteVolumenM3 && volumenTotal > carrierCfg.limiteVolumenM3)
      return false;

    // Si algún producto restringe explícitamente los transportistas
    // permitidos, todos los productos del carrito deben aceptar a este.
    if (
      transportistasPermitidosPorProducto.length > 0 &&
      !transportistasPermitidosPorProducto.every((permitidos) =>
        permitidos.includes(provider.id)
      )
    ) {
      return false;
    }

    return true;
  });

  const origen = {
    codigoPostal: NUBARI_ORIGIN.codigoPostal,
    localidad: NUBARI_ORIGIN.localidad,
    provincia: NUBARI_ORIGIN.provincia,
  };

  const resultados = await Promise.allSettled(
    proveedoresElegibles.map((provider) => provider.getQuote({ origen, destino, bultos }))
  );

  const opciones: ShippingQuoteResult["opciones"] = [];
  const errores: ShippingQuoteResult["errores"] = [];

  resultados.forEach((res, idx) => {
    const provider = proveedoresElegibles[idx];
    if (res.status === "fulfilled") {
      opciones.push(...res.value);
    } else {
      const reason = res.reason;
      const motivo =
        reason instanceof ShippingProviderUnavailableError
          ? "Este medio de envío no está disponible temporalmente."
          : "No se pudo obtener la cotización de este transportista.";
      errores.push({ carrier: provider.id, motivo });
    }
  });

  if (proveedoresElegibles.length === 0) {
    errores.push({
      carrier: "andreani",
      motivo:
        "No hay transportistas disponibles para este envío según su peso/volumen. Solicitá cotización manual.",
    });
  }

  return { destino, opciones, errores };
}

export function cartLinesToItems(
  lines: CartLine[],
  getProduct: (id: string) => Product | undefined
) {
  return lines
    .map((line) => {
      const product = getProduct(line.productId);
      if (!product) return null;
      return { product, cantidad: line.cantidad };
    })
    .filter((x): x is { product: Product; cantidad: number } => x !== null);
}
