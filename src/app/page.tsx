import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, Sparkles, Truck, Gem, CreditCard } from "lucide-react";
import { queryProducts } from "@/lib/db/products";
import ProductCard from "@/components/ProductCard";
import { CATEGORY_LABELS } from "@/lib/utils";

const CATEGORIES: { key: string; img: string }[] = [
  { key: "banquetas", img: "/images/categories/banquetas.svg" },
  { key: "organizacion", img: "/images/categories/organizacion.svg" },
  { key: "hogar", img: "/images/categories/hogar.svg" },
  { key: "oficina", img: "/images/categories/oficina.svg" },
  { key: "cocina", img: "/images/categories/cocina.svg" },
  { key: "novedades", img: "/images/categories/novedades.svg" },
];

const HERO_ICONS = [
  { icon: Truck, title: "Envíos a todo el país" },
  { icon: CreditCard, title: "Hasta 6 cuotas sin interés" },
  { icon: ShieldCheck, title: "Compra segura y garantizada" },
];

const RAZONES = [
  { icon: Gem, title: "Diseño exclusivo", text: "Piezas con identidad propia" },
  { icon: Sparkles, title: "Materiales de calidad", text: "Seleccionados para durar" },
  { icon: ShieldCheck, title: "Funcionalidad en tu día a día", text: "Soluciones prácticas y bellas" },
  { icon: Truck, title: "Espacios con alma", text: "Cada rincón cuenta una historia" },
];

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const destacados = (
    await queryProducts({ ordenar: "destacados", soloDisponibles: false })
  ).slice(0, 8);

  return (
    <div>
      {/* HERO */}
      <section className="bg-nb-black">
        <div className="container-nb grid lg:grid-cols-2 gap-12 items-center py-14 lg:py-20">
          <div className="max-w-lg nb-reveal">
            <h1 className="font-serif text-4xl sm:text-5xl md:text-[3.4rem] leading-[1.08] text-nb-cream">
              Diseño que se vive
            </h1>
            <p className="mt-6 text-nb-beige">
              Muebles y accesorios de diseño para un hogar con alma.
            </p>
            <Link
              href="/productos"
              className="inline-block mt-8 px-8 py-3.5 bg-nb-champagne text-nb-black text-xs tracking-widest3 uppercase hover:bg-nb-gold transition-colors duration-200 focus-ring"
            >
              Ver colección →
            </Link>

            <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
              {HERO_ICONS.map(({ icon: Icon, title }) => (
                <div key={title} className="flex items-start gap-2.5">
                  <Icon size={19} className="text-nb-champagne flex-shrink-0 mt-0.5" strokeWidth={1.4} />
                  <p className="text-[11px] tracking-wide uppercase text-nb-beige leading-snug">
                    {title}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative aspect-[4/5] sm:aspect-[5/4] overflow-hidden">
            <Image
              src="/images/hero.jpg"
              alt="Banqueta Nubari ambientada en dormitorio"
              fill
              priority
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="container-nb py-20">
        <h2 className="text-center font-serif text-2xl sm:text-3xl text-nb-cream tracking-wide mb-12">
          Nuestras categorías
        </h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-6">
          {CATEGORIES.map((c) => (
            <Link key={c.key} href={`/productos?categoria=${c.key}`} className="group flex flex-col items-center gap-3">
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-nb-carbon border border-nb-line/70 group-hover:border-nb-champagne transition-colors">
                <Image
                  src={c.img}
                  alt={CATEGORY_LABELS[c.key]}
                  fill
                  className="object-cover transition-transform duration-500 ease-soft group-hover:scale-105"
                />
              </div>
              <span className="text-[10px] sm:text-[11px] tracking-widest3 uppercase text-nb-beige text-center group-hover:text-nb-champagne transition-colors">
                {CATEGORY_LABELS[c.key]}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="container-nb py-8 pb-24">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="font-serif text-3xl text-nb-cream">Productos destacados</h2>
            <p className="text-sm text-nb-beige mt-2">
              Piezas pensadas para transformar tus espacios.
            </p>
          </div>
          <Link href="/productos" className="text-xs tracking-widest3 uppercase text-nb-champagne hover:text-nb-gold transition-colors">
            Ver todos →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
          {destacados.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* DETALLES QUE HACEN HOGAR */}
      <section className="bg-nb-carbon py-20 border-y border-nb-line/70">
        <div className="container-nb grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="font-serif text-3xl sm:text-4xl text-nb-cream leading-tight">
              Detalles que hacen hogar
            </h2>
            <p className="mt-5 text-nb-beige max-w-md">
              Diseño, funcionalidad y calidad en cada pieza.
            </p>
            <Link
              href="/nosotros"
              className="inline-block mt-8 px-7 py-3 bg-nb-champagne text-nb-black text-xs tracking-widest3 uppercase hover:bg-nb-gold transition-colors"
            >
              Explorar inspiración →
            </Link>
          </div>
          <div className="border border-nb-champagne/40 p-10 text-center">
            <p className="font-serif text-2xl sm:text-3xl text-nb-cream italic leading-snug">
              "Tu casa,
              <br />
              tu mejor lugar"
            </p>
          </div>
        </div>
      </section>

      {/* POR QUÉ ELEGIR NUBARI */}
      <section className="container-nb py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {RAZONES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="text-center flex flex-col items-center">
              <Icon size={26} className="text-nb-champagne mb-3" strokeWidth={1.3} />
              <p className="text-sm tracking-wide uppercase text-nb-cream mb-1">{title}</p>
              <p className="text-sm text-nb-beige">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="bg-nb-carbon py-16 border-y border-nb-line/70">
        <div className="container-nb text-center max-w-xl">
          <p className="text-xs tracking-widest3 uppercase text-nb-champagne mb-3">Sumate a Nubari</p>
          <p className="text-nb-beige mb-6">
            Recibí novedades, lanzamientos y promociones exclusivas.
          </p>
          <form className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Tu e-mail"
              className="flex-1 px-4 py-3 bg-nb-black border border-nb-line/70 text-nb-cream text-sm placeholder:text-nb-beige/50 focus:outline-none focus:border-nb-champagne"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-nb-champagne text-nb-black text-xs tracking-widest3 uppercase hover:bg-nb-gold transition-colors"
            >
              Suscribirme
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
