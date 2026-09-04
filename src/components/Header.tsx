"use client";

import Link from "next/link";
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
      <header className="bg-nb-black/95 backdrop-blur-md border-b border-nb-line/60">
        <div className="container-nb flex items-center justify-between h-20">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full border border-nb-champagne/50 flex items-center justify-center flex-shrink-0">
              <span className="font-serif text-lg text-nb-champagne">N</span>
            </div>
            <span className="hidden sm:block leading-none">
              <span className="font-serif text-xl tracking-wide text-nb-cream block">
                NUBARI
              </span>
              <span className="block text-[10px] tracking-widest2 text-nb-champagne mt-0.5">
                DECO
              </span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs tracking-widest3 uppercase text-nb-beige/85 hover:text-nb-champagne transition-colors duration-200 focus-ring"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-5">
            <button
              aria-label="Buscar"
              className="hidden sm:inline-flex text-nb-beige/85 hover:text-nb-champagne transition-colors focus-ring"
            >
              <Search size={18} strokeWidth={1.5} />
            </button>
            <Link
              href="/admin"
              aria-label="Cuenta"
              className="hidden sm:inline-flex text-nb-beige/85 hover:text-nb-champagne transition-colors focus-ring"
            >
              <User size={18} strokeWidth={1.5} />
            </Link>
            <Link
              href="/carrito"
              aria-label="Carrito"
              className="relative inline-flex text-nb-beige/85 hover:text-nb-champagne transition-colors focus-ring"
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
              className="lg:hidden text-nb-beige/85 focus-ring"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X size={22} strokeWidth={1.5} /> : <Menu size={22} strokeWidth={1.5} />}
            </button>
          </div>
        </div>

        {open && (
          <nav className="lg:hidden border-t border-nb-line/60 bg-nb-black">
            <div className="container-nb flex flex-col py-4">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="py-3 text-sm tracking-wide text-nb-beige/90 border-b border-nb-line/40 last:border-none"
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
