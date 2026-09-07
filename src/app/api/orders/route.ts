import { NextRequest, NextResponse } from "next/server";
import { createOrder, getAllOrders } from "@/lib/db/orders";
import { getProductById } from "@/lib/db/products";
import type { CartLine, Destino, ShippingQuoteOption } from "@/lib/types";
import { TELA_LABELS } from "@/lib/utils";

export async function GET() {
  return NextResponse.json(await getAllOrders());
}

interface CreateOrderBody {
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
  lines: CartLine[];
  envio: ShippingQuoteOption | null;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateOrderBody;

    if (!body.cliente?.email || !body.lines?.length) {
      return NextResponse.json(
        { error: "Faltan datos del cliente o el carrito está vacío" },
        { status: 400 }
      );
    }

    const itemsResolved = await Promise.all(
      body.lines.map(async (line) => {
        const product = await getProductById(line.productId);
        if (!product) return null;
        const variant = product.variantes.find((v) => v.id === line.variantId);
        const largo = product.largos?.find((m) => m.id === line.largoId);
        const tela = product.telas?.find((t) => t.tipo === line.telaTipo);
        const colorTela = tela?.colores.find((c) => c.id === line.telaColorId);
        return {
          productId: product.id,
          productName: product.nombre,
          variantId: variant?.id,
          variantLabel:
            [
              variant?.color,
              variant?.material,
              largo ? `${largo.cm} cm` : null,
              colorTela ? `${TELA_LABELS[line.telaTipo!]} ${colorTela.nombre}` : null,
            ]
              .filter(Boolean)
              .join(" · ") || undefined,
          cantidad: line.cantidad,
          precioUnitario: product.precio + (variant?.priceDelta ?? 0) + (largo?.priceDelta ?? 0),
          imagen: product.imagenes[0],
        };
      })
    );
    const items = itemsResolved.filter((x): x is NonNullable<typeof x> => x !== null);

    const subtotal = items.reduce((acc, i) => acc + i.precioUnitario * i.cantidad, 0);
    const envioPrice = body.envio?.price ?? 0;
    const total = subtotal + envioPrice;

    const order = await createOrder({
      cliente: body.cliente,
      items,
      subtotal,
      envio: body.envio
        ? {
            carrier: body.envio.carrier,
            mode: body.envio.mode,
            price: body.envio.price,
            label: `${body.envio.carrierLabel} · ${body.envio.modeLabel}`,
          }
        : null,
      total,
      estado: "pendiente_pago",
      metodoPago: "pendiente",
    });

    return NextResponse.json(order, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: "No se pudo crear el pedido", detail: (err as Error).message },
      { status: 500 }
    );
  }
}
