import { NextRequest, NextResponse } from "next/server";
import { getOrderById, updateOrderStatus } from "@/lib/db/orders";
import type { OrderStatus } from "@/lib/types";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const order = await getOrderById(params.id);
  if (!order) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json(order);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const estado = body.estado as OrderStatus;
  const updated = await updateOrderStatus(params.id, estado);
  if (!updated) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json(updated);
}
