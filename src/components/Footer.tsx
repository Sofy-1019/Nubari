import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-nb-black text-nb-bone mt-32">
      <div className="container-nb py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <div className="relative w-14 h-14 rounded-full overflow-hidden mb-3">
            <Image src="/images/logo/nubari-logo-circle.jpg" alt="Nubari" fill className="object-cover" />
          </div>
          <p className="font-serif text-2xl">Nubari</p>
          <p className="text-xs tracking-widest2 text-nb-rose mt-1">DECO</p>
          <p className="text-sm text-nb-bone/60 mt-4 max-w-xs">
            Diseñamos muebles para vivirlos: pensados para acompañar cada espacio del hogar.
          </p>
        </div>

        <div>
          <p className="text-sm text-nb-bone/50 mb-4">Tienda</p>
          <ul className="space-y-2 text-sm text-nb-bone/80">
            <li><Link href="/productos" className="hover:text-nb-rose transition-colors">Todos los productos</Link></li>
            <li><Link href="/productos?categoria=banquetas" className="hover:text-nb-rose transition-colors">Banquetas</Link></li>
            <li><Link href="/productos?categoria=organizacion" className="hover:text-nb-rose transition-colors">Organización</Link></li>
            <li><Link href="/productos?categoria=novedades" className="hover:text-nb-rose transition-colors">Novedades</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-sm text-nb-bone/50 mb-4">Nubari</p>
          <ul className="space-y-2 text-sm text-nb-bone/80">
            <li><Link href="/nosotros" className="hover:text-nb-rose transition-colors">Nuestra esencia</Link></li>
            <li><Link href="/contacto" className="hover:text-nb-rose transition-colors">Contacto</Link></li>
            <li><Link href="/admin" className="hover:text-nb-rose transition-colors">Administrador</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-sm text-nb-bone/50 mb-4">Envíos</p>
          <p className="text-sm text-nb-bone/80">
            Despachamos desde Berazategui, Buenos Aires a todo el país mediante Andreani y Vía Cargo.
          </p>
        </div>
      </div>
      <div className="border-t border-nb-bone/10">
        <div className="container-nb py-6 text-xs text-nb-bone/40">
          © {new Date().getFullYear()} Nubari Deco. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
