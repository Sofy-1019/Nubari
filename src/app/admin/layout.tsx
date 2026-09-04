import Link from "next/link";

const LINKS = [
  { href: "/admin", label: "Resumen" },
  { href: "/admin/productos", label: "Productos" },
  { href: "/admin/pedidos", label: "Pedidos" },
  { href: "/admin/envios", label: "Envíos" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-nb-black">
      <div className="container-nb py-10 grid md:grid-cols-[220px_1fr] gap-10">
        <aside>
          <p className="font-serif text-2xl text-nb-cream mb-6">Administrador</p>
          <nav className="space-y-1">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="block px-3 py-2.5 text-sm text-nb-beige/85 hover:bg-nb-card hover:text-nb-champagne transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <Link
            href="/"
            className="block mt-8 text-sm text-nb-beige/50 hover:text-nb-champagne transition-colors"
          >
            ← Volver a la tienda
          </Link>
        </aside>
        <div>{children}</div>
      </div>
    </div>
  );
}
