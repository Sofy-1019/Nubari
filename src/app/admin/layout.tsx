import Link from "next/link";

const LINKS = [
  { href: "/admin", label: "Resumen" },
  { href: "/admin/productos", label: "Productos" },
  { href: "/admin/pedidos", label: "Pedidos" },
  { href: "/admin/envios", label: "Envíos" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container-nb py-10 grid md:grid-cols-[200px_1fr] gap-10">
      <aside>
        <p className="font-serif text-xl text-nb-black mb-6">Administrador</p>
        <nav className="space-y-1">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="block px-3 py-2 text-sm text-nb-ink hover:bg-nb-sand transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <Link href="/" className="block mt-8 text-xs text-nb-taupe hover:text-nb-wood">
          ← Volver a la tienda
        </Link>
      </aside>
      <div>{children}</div>
    </div>
  );
}
