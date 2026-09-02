import Link from "next/link";
import { getAllProducts } from "@/lib/db/products";
import { getAllOrders } from "@/lib/db/orders";
import { formatARS } from "@/lib/utils";

export default function AdminDashboard() {
  const products = getAllProducts();
  const orders = getAllOrders();
  const pendientes = orders.filter((o) => o.estado === "pendiente_pago").length;
  const ventasTotal = orders.reduce((acc, o) => acc + o.total, 0);

  return (
    <div>
      <h1 className="font-serif text-3xl text-nb-black mb-8">Resumen</h1>
      <div className="grid sm:grid-cols-3 gap-4 mb-10">
        <Stat label="Productos activos" value={products.filter((p) => p.activo).length} />
        <Stat label="Pedidos" value={orders.length} sub={`${pendientes} pendientes de pago`} />
        <Stat label="Ventas registradas" value={formatARS(ventasTotal)} />
      </div>
      <div className="flex gap-4">
        <Link href="/admin/productos/nuevo" className="px-5 py-3 bg-nb-black text-nb-bone text-sm hover:bg-nb-ink transition-colors">
          + Nuevo producto
        </Link>
        <Link href="/admin/pedidos" className="px-5 py-3 border border-nb-black text-sm hover:bg-nb-sand transition-colors">
          Ver pedidos
        </Link>
      </div>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="border border-nb-black/10 p-5">
      <p className="text-xs text-nb-taupe">{label}</p>
      <p className="font-serif text-2xl text-nb-black mt-1">{value}</p>
      {sub && <p className="text-xs text-nb-stone mt-1">{sub}</p>}
    </div>
  );
}
