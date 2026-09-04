import { ShoppingBag, Truck, CreditCard, PackageCheck } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Cómo comprar" };

const PASOS = [
  { icon: ShoppingBag, title: "Elegí tus productos", text: "Recorré el catálogo y agregá lo que te guste al carrito." },
  { icon: Truck, title: "Calculá tu envío", text: "Completá tu dirección y código postal para ver las opciones disponibles." },
  { icon: CreditCard, title: "Confirmá tu compra", text: "Cargá tus datos y elegí el medio de pago." },
  { icon: PackageCheck, title: "Recibí tu pedido", text: "Te contactamos para coordinar la entrega o el retiro en sucursal." },
];

export default function ComoComprarPage() {
  return (
    <div className="container-nb py-20 max-w-3xl">
      <h1 className="font-serif text-4xl text-nb-cream mb-12 text-center">Cómo comprar</h1>
      <div className="space-y-8">
        {PASOS.map((p, i) => (
          <div key={p.title} className="flex gap-5">
            <div className="w-11 h-11 rounded-full border border-nb-champagne/50 flex items-center justify-center flex-shrink-0">
              <p.icon size={18} className="text-nb-champagne" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-nb-cream font-serif text-lg">{i + 1}. {p.title}</p>
              <p className="text-sm text-nb-beige/60 mt-1">{p.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
