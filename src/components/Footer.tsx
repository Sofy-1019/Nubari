import Link from "next/link";
import { Instagram, Facebook } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-nb-black text-nb-beige/80 mt-32 border-t border-nb-line/60">
      <div className="container-nb py-16 grid grid-cols-2 md:grid-cols-5 gap-10">
        <div className="col-span-2">
          <div className="w-14 h-14 rounded-full border border-nb-champagne/50 flex items-center justify-center mb-3">
            <span className="font-serif text-2xl text-nb-champagne">N</span>
          </div>
          <p className="font-serif text-2xl text-nb-cream">NUBARI</p>
          <p className="text-[10px] tracking-widest2 text-nb-champagne mt-1">DECO</p>
          <p className="text-sm text-nb-beige/60 mt-4 max-w-xs">
            Diseño · Estilo · Hogar. Muebles y accesorios pensados para acompañar cada espacio.
          </p>
        </div>

        <div>
          <p className="text-xs tracking-widest3 uppercase text-nb-champagne mb-4">Información</p>
          <ul className="space-y-2 text-sm">
            <li><Link href="/nosotros" className="hover:text-nb-champagne transition-colors">Nosotros</Link></li>
            <li><Link href="/como-comprar" className="hover:text-nb-champagne transition-colors">Cómo comprar</Link></li>
            <li><Link href="/contacto" className="hover:text-nb-champagne transition-colors">Envíos</Link></li>
            <li><Link href="/contacto" className="hover:text-nb-champagne transition-colors">Devoluciones</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-xs tracking-widest3 uppercase text-nb-champagne mb-4">Productos</p>
          <ul className="space-y-2 text-sm">
            <li><Link href="/productos?categoria=banquetas" className="hover:text-nb-champagne transition-colors">Bancos y Banquetas</Link></li>
            <li><Link href="/productos?categoria=organizacion" className="hover:text-nb-champagne transition-colors">Organizadores</Link></li>
            <li><Link href="/productos?categoria=hogar" className="hover:text-nb-champagne transition-colors">Muebles Auxiliares</Link></li>
            <li><Link href="/productos?categoria=cocina" className="hover:text-nb-champagne transition-colors">Cocina</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-xs tracking-widest3 uppercase text-nb-champagne mb-4">Contacto</p>
          <ul className="space-y-2 text-sm">
            <li>hola@nubari.com.ar</li>
            <li>Berazategui, Buenos Aires</li>
          </ul>
          <div className="flex gap-3 mt-4">
            <a href="#" aria-label="Instagram" className="text-nb-beige/70 hover:text-nb-champagne transition-colors"><Instagram size={16} /></a>
            <a href="#" aria-label="Facebook" className="text-nb-beige/70 hover:text-nb-champagne transition-colors"><Facebook size={16} /></a>
          </div>
        </div>
      </div>
      <div className="border-t border-nb-line/60">
        <div className="container-nb py-6 text-[11px] text-nb-beige/40 flex flex-col sm:flex-row justify-between gap-2">
          <span>© {new Date().getFullYear()} Nubari Deco. Todos los derechos reservados.</span>
          <span>Envíos con Andreani &amp; Vía Cargo · Pagos protegidos</span>
        </div>
      </div>
    </footer>
  );
}
