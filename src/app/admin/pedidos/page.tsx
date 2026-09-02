import { getAllOrders } from "@/lib/db/orders";
import { formatARS } from "@/lib/utils";
import OrderStatusSelect from "./OrderStatusSelect";

const ESTADOS_LABEL: Record<string, string> = {
  pendiente_pago: "Pendiente de pago",
  pago_aprobado: "Pago aprobado",
  preparando: "Preparando",
  despachado: "Despachado",
  en_transito: "En tránsito",
  entregado: "Entregado",
  cancelado: "Cancelado",
};

export default function AdminPedidosPage() {
  const orders = getAllOrders();

  return (
    <div>
      <h1 className="font-serif text-3xl text-nb-black mb-8">Pedidos</h1>

      {orders.length === 0 && <p className="text-sm text-nb-stone">Todavía no hay pedidos.</p>}

      <div className="space-y-4">
        {orders.map((o) => (
          <div key={o.id} className="border border-nb-black/10 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div>
                <p className="text-sm text-nb-black">
                  #{o.numero} · {new Date(o.creadoEn).toLocaleDateString("es-AR")}
                </p>
                <p className="text-xs text-nb-stone">
                  {o.cliente.nombre} {o.cliente.apellido} · {o.cliente.email} · {o.cliente.telefono}
                </p>
              </div>
              <OrderStatusSelect orderId={o.id} estado={o.estado} />
            </div>

            <ul className="text-sm text-nb-stone space-y-1 mb-3">
              {o.items.map((it, i) => (
                <li key={i}>
                  {it.productName} {it.variantLabel && `(${it.variantLabel})`} × {it.cantidad} —{" "}
                  {formatARS(it.precioUnitario * it.cantidad)}
                </li>
              ))}
            </ul>

            <div className="text-sm text-nb-stone">
              <p>
                Destino: {o.cliente.direccion} {o.cliente.numero}, {o.cliente.localidad},{" "}
                {o.cliente.provincia} (CP {o.cliente.codigoPostal})
              </p>
              {o.envio && (
                <p>
                  Envío: {o.envio.label} — {formatARS(o.envio.price)}
                </p>
              )}
              <p className="text-nb-black mt-1">Total: {formatARS(o.total)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
