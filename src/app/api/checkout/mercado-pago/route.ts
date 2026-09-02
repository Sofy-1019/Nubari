import { NextRequest, NextResponse } from "next/server";

// ==========================================================================
// Integración con Mercado Pago — PREPARADA, no activa.
//
// Para activarla:
//   1. Crear una app en https://www.mercadopago.com.ar/developers
//   2. Definir MP_ACCESS_TOKEN en .env (token privado, nunca en frontend)
//   3. Instalar el SDK oficial:  npm install mercadopago
//   4. Reemplazar el bloque de abajo por la creación real de una
//      "preference" y devolver `init_point` para redirigir al checkout.
// ==========================================================================

export async function POST(req: NextRequest) {
  const accessToken = process.env.MP_ACCESS_TOKEN;

  if (!accessToken) {
    return NextResponse.json(
      {
        error: "Mercado Pago no está configurado todavía.",
        detail:
          "Definí MP_ACCESS_TOKEN en tu archivo .env y completá la integración en " +
          "src/app/api/checkout/mercado-pago/route.ts para activar el cobro real.",
      },
      { status: 501 }
    );
  }

  const body = await req.json();

  // --- Ejemplo de lo que iría acá una vez instalado el SDK oficial ---
  // import { MercadoPagoConfig, Preference } from "mercadopago";
  // const client = new MercadoPagoConfig({ accessToken });
  // const preference = await new Preference(client).create({
  //   body: {
  //     items: body.items,
  //     back_urls: {
  //       success: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/exito`,
  //       failure: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/error`,
  //     },
  //     auto_return: "approved",
  //     external_reference: body.orderId,
  //   },
  // });
  // return NextResponse.json({ init_point: preference.init_point });

  return NextResponse.json(
    { error: "Integración pendiente de implementar" },
    { status: 501 }
  );
}
