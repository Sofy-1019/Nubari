import { nanoid } from "nanoid";
import { readAll, readOne, upsert } from "./jsonStore";
import type { Order, OrderStatus } from "../types";

const COLLECTION = "orders";

export function getAllOrders(): Order[] {
  return readAll<Order>(COLLECTION).sort(
    (a, b) => +new Date(b.creadoEn) - +new Date(a.creadoEn)
  );
}

export function getOrderById(id: string): Order | undefined {
  return readOne<Order>(COLLECTION, id);
}

export function createOrder(data: Omit<Order, "id" | "numero" | "creadoEn">): Order {
  const orders = getAllOrders();
  const numero = `NB-${String(orders.length + 1001)}`;
  const order: Order = {
    ...data,
    id: nanoid(12),
    numero,
    creadoEn: new Date().toISOString(),
  };
  return upsert(COLLECTION, order);
}

export function updateOrderStatus(id: string, estado: OrderStatus): Order | undefined {
  const order = getOrderById(id);
  if (!order) return undefined;
  const updated = { ...order, estado };
  return upsert(COLLECTION, updated);
}
