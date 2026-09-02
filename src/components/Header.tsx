"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useCart } from "@/lib/cartContext";

const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/productos", label: "Productos" },
  { href: "/categorias", label: "Categorías" },
  { href: "/nosotros", label: "Nosotros" },
  { href: "/contacto", label: "Contacto" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const { lines } = useCart();
  const cartCount = lines.reduce((acc, l) => acc + l.cantidad, 0);

  return (
    <header className="sticky top-0 z-40 bg-nb-bone/95 backdrop-blur border-b border-nb-black/10">
      <div className="container-nb flex items-center justify-between h-20">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative w-11 h-11 rounded-full overflow-hidden bg-nb-black flex-shrink-0">
            <Image
              src="/images/logo/nubari-logo-circle.jpg"
              alt="Nubari"
              fill
              className="object-cover"
              priority
            />
          </div>
          <span className="hidden sm:block">
            <span className="font-serif text-2xl tracking-wide text-nb-black leading-none block">
              Nubari
            </span>
            <span className="block text-[10px] tracking-widest2 text-nb-wood">
              DECO
            </span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-9">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-nb-ink hover:text-nb-wood transition-colors duration-200 focus-ring"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-5">
          <button
            aria-label="Buscar"
            className="hidden sm:inline-flex text-nb-ink hover:text-nb-wood transition-colors focus-ring"
          >
            <Search size={19} strokeWidth={1.5} />
          </button>
          <Link
            href="/admin"
            aria-label="Administrador"
            className="hidden sm:inline-flex text-nb-ink hover:text-nb-wood transition-colors focus-ring"
          >
            <User size={19} strokeWidth={1.5} />
          </Link>
          <Link
            href="/carrito"
            aria-label="Carrito"
            className="relative inline-flex text-nb-ink hover:text-nb-wood transition-colors focus-ring"
          >
            <ShoppingBag size={19} strokeWidth={1.5} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-nb-wood text-nb-bone text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
          <button
            aria-label="Menú"
            className="md:hidden text-nb-ink focus-ring"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={22} strokeWidth={1.5} /> : <Menu size={22} strokeWidth={1.5} />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="md:hidden border-t border-nb-black/10 bg-nb-bone">
          <div className="container-nb flex flex-col py-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="py-3 text-base text-nb-ink border-b border-nb-black/5 last:border-none"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
