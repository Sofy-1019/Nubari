"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useCart } from "@/lib/cartContext";
import TopBar from "./TopBar";

const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/productos", label: "Productos" },
  { href: "/categorias", label: "Categorías" },
  { href: "/nosotros", label: "Nosotros" },
  { href: "/como-comprar", label: "Cómo comprar" },
  { href: "/contacto", label: "Contacto" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const { lines } = useCart();
  const cartCount = lines.reduce((acc, l) => acc + l.cantidad, 0);

  return (
    <div className="sticky top-0 z-50">
      <TopBar />
      <header className="bg-nb-black/95 backdrop-blur-md border-b border-nb-line/70">
        <div className="container-nb flex items-center justify-between h-20">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0 ring-1 ring-nb-champagne/60">
              <Image
                src="/images/logo/nubari-logo-new.png"
                alt="Nubari Deco"
                fill
                className="object-cover"
                priority
                quality={100}
              />
            </div>
            <div className="leading-none hidden xs:block">
              <p className="font-serif text-lg tracking-wide text-nb-cream">NUBARI</p>
              <p className="text-[9px] tracking-widest2 text-nb-champagne">DECO</p>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs tracking-widest3 uppercase text-nb-beige hover:text-nb-champagne transition-colors duration-200 focus-ring"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-5">
            <button
              aria-label="Buscar"
              className="hidden sm:inline-flex text-nb-beige hover:text-nb-champagne transition-colors focus-ring"
            >
              <Search size={18} strokeWidth={1.5} />
            </button>
            <Link
              href="/admin"
              aria-label="Cuenta"
              className="hidden sm:inline-flex text-nb-beige hover:text-nb-champagne transition-colors focus-ring"
            >
              <User size={18} strokeWidth={1.5} />
            </Link>
            <Link
              href="/carrito"
              aria-label="Carrito"
              className="relative inline-flex text-nb-beige hover:text-nb-champagne transition-colors focus-ring"
            >
              <ShoppingBag size={18} strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-nb-champagne text-nb-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-medium">
                  {cartCount}
                </span>
              )}
            </Link>
            <button
              aria-label="Menú"
              className="lg:hidden text-nb-beige focus-ring"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X size={22} strokeWidth={1.5} /> : <Menu size={22} strokeWidth={1.5} />}
            </button>
          </div>
        </div>

        {open && (
          <nav className="lg:hidden border-t border-nb-line/70 bg-nb-black">
            <div className="container-nb flex flex-col py-4">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="py-3 text-sm tracking-wide text-nb-cream border-b border-nb-line/50 last:border-none"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </header>
    </div>
  );
}
