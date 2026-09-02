import { NextRequest, NextResponse } from "next/server";
import { getProductById } from "@/lib/db/products";
import { cartLinesToItems, quoteShippingForCart } from "@/lib/shipping/shippingService";
import type { CartLine, Destino } from "@/lib/types";

interface QuoteBody {
  lines: CartLine[];
  destino: Destino;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as QuoteBody;

    if (!body.destino?.codigoPostal) {
      return NextResponse.json(
        { error: "Falta el código postal de destino" },
        { status: 400 }
      );
    }
    if (!body.lines || body.lines.length === 0) {
      return NextResponse.json({ error: "El carrito está vacío" }, { status: 400 });
    }

    const items = await cartLinesToItems(body.lines, getProductById);
    if (items.length === 0) {
      return NextResponse.json(
        { error: "No se encontraron los productos del carrito" },
        { status: 400 }
      );
    }

    const result = await quoteShippingForCart({ items, destino: body.destino });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: "No se pudo cotizar el envío", detail: (err as Error).message },
      { status: 500 }
    );
  }
}
