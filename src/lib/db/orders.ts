import { nanoid } from "nanoid";
import { readAll, readOne, upsert } from "./jsonStore";
import type { Order, OrderStatus } from "../types";

const COLLECTION = "orders";

export async function getAllOrders(): Promise<Order[]> {
  const all = await readAll<Order>(COLLECTION);
  return all.sort((a, b) => +new Date(b.creadoEn) - +new Date(a.creadoEn));
}

export async function getOrderById(id: string): Promise<Order | undefined> {
  return readOne<Order>(COLLECTION, id);
}

export async function createOrder(
  data: Omit<Order, "id" | "numero" | "creadoEn">
): Promise<Order> {
  const orders = await getAllOrders();
  const numero = `NB-${String(orders.length + 1001)}`;
  const order: Order = {
    ...data,
    id: nanoid(12),
    numero,
    creadoEn: new Date().toISOString(),
  };
  return upsert(COLLECTION, order);
}

export async function updateOrderStatus(
  id: string,
  estado: OrderStatus
): Promise<Order | undefined> {
  const order = await getOrderById(id);
  if (!order) return undefined;
  const updated = { ...order, estado };
  return upsert(COLLECTION, updated);
}
