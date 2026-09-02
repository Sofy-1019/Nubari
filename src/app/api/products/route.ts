import { NextRequest, NextResponse } from "next/server";
import { createProduct, getAllProducts, queryProducts } from "@/lib/db/products";
import { slugify } from "@/lib/utils";
import type { ProductCategory } from "@/lib/types";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const admin = searchParams.get("admin") === "1";

  if (admin) {
    return NextResponse.json(getAllProducts());
  }

  const products = queryProducts({
    categoria: (searchParams.get("categoria") as ProductCategory) || undefined,
    precioMin: searchParams.get("precioMin") ? Number(searchParams.get("precioMin")) : undefined,
    precioMax: searchParams.get("precioMax") ? Number(searchParams.get("precioMax")) : undefined,
    color: searchParams.get("color") || undefined,
    material: searchParams.get("material") || undefined,
    soloDisponibles: searchParams.get("soloDisponibles") === "1",
    ordenar: (searchParams.get("ordenar") as any) || undefined,
  });

  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.nombre || !body.precio) {
      return NextResponse.json(
        { error: "nombre y precio son obligatorios" },
        { status: 400 }
      );
    }
    const product = createProduct({
      ...body,
      slug: body.slug || slugify(body.nombre),
    });
    return NextResponse.json(product, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: "No se pudo crear el producto", detail: (err as Error).message },
      { status: 500 }
    );
  }
}
