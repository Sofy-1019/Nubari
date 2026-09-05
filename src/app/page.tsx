import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, Sparkles, Truck, Gem } from "lucide-react";
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

const BENEFICIOS = [
  { icon: Sparkles, title: "Diseño exclusivo", text: "Estilo minimalista y moderno" },
  { icon: Gem, title: "Calidad premium", text: "Materiales seleccionados" },
  { icon: Truck, title: "Envíos a todo el país", text: "Andreani & Vía Cargo" },
  { icon: ShieldCheck, title: "Compra segura", text: "Protección en tus pagos" },
];

const RAZONES = [
  { title: "Diseño minimalista", text: "Líneas simples que se adaptan a tu hogar." },
  { title: "Funcionalidad", text: "Soluciones prácticas para cada ambiente." },
  { title: "Calidad garantizada", text: "Materiales resistentes y duraderos." },
  { title: "Atención personalizada", text: "Te acompañamos antes, durante y después de tu compra." },
];

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const destacados = (
    await queryProducts({ ordenar: "destacados", soloDisponibles: false })
  ).slice(0, 8);

  return (
    <div>
      {/* HERO */}
      <section className="relative min-h-[92vh] flex items-end bg-nb-black text-nb-cream overflow-hidden">
        <div className="absolute inset-0 opacity-80">
          <Image
            src="/images/hero.svg"
            alt="Banqueta Nubari ambientada en dormitorio"
            fill
            priority
            className="object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-nb-black via-nb-black/60 to-transparent" />
        <div className="container-nb relative pb-24 pt-40">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-8">
            <div className="relative w-28 h-28 sm:w-36 sm:h-36 flex-shrink-0 nb-reveal">
              <Image
                src="/images/logo/nubari-logo-rect.jpg"
                alt="Nubari Deco"
                fill
                className="object-contain"
              />
            </div>
            <div>
              <p className="text-[11px] tracking-widest2 text-nb-champagne mb-5 nb-reveal">
                DISEÑO · ESTILO · HOGAR
              </p>
              <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl leading-[1.05] max-w-2xl nb-reveal">
                Diseño que transforma tu hogar
              </h1>
            </div>
          </div>
          <p className="mt-6 text-nb-beige/80 max-w-md nb-reveal">
            Muebles y accesorios de diseño pensados para aportar estilo, funcionalidad y
            elegancia a cada espacio.
          </p>
          <div className="mt-9 flex flex-wrap gap-4 nb-reveal">
            <Link
              href="/productos"
              className="px-8 py-3.5 bg-nb-champagne text-nb-black text-xs tracking-widest3 uppercase hover:bg-nb-gold transition-colors duration-200 focus-ring"
            >
              Ver colección
            </Link>
            <Link
              href="/nosotros"
              className="px-8 py-3.5 border border-nb-beige/40 text-nb-beige text-xs tracking-widest3 uppercase hover:border-nb-champagne hover:text-nb-champagne transition-colors duration-200 focus-ring"
            >
              Descubrir Nubari
            </Link>
          </div>
        </div>
      </section>

      {/* BENEFICIOS */}
      <section className="bg-nb-carbon border-b border-nb-line/60">
        <div className="container-nb py-8 grid grid-cols-2 md:grid-cols-4 gap-8">
          {BENEFICIOS.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-start gap-3">
              <Icon size={20} className="text-nb-champagne flex-shrink-0 mt-0.5" strokeWidth={1.4} />
              <div>
                <p className="text-xs tracking-wide uppercase text-nb-cream">{title}</p>
                <p className="text-xs text-nb-beige/55 mt-0.5">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="container-nb py-24">
        <h2 className="text-center font-serif text-2xl sm:text-3xl text-nb-cream tracking-wide mb-12">
          Explorá nuestras categorías
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {CATEGORIES.map((c) => (
            <Link
              key={c.key}
              href={`/productos?categoria=${c.key}`}
              className="group relative aspect-square overflow-hidden bg-nb-card border border-nb-line/60"
            >
              <Image
                src={c.img}
                alt={CATEGORY_LABELS[c.key]}
                fill
                className="object-cover opacity-80 transition-transform duration-500 ease-soft group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-nb-black/40 group-hover:bg-nb-black/25 transition-colors duration-200" />
              <span className="absolute bottom-3 left-3 right-3 text-nb-cream text-[11px] tracking-widest3 uppercase">
                {CATEGORY_LABELS[c.key]}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="container-nb py-8 pb-28">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="font-serif text-3xl text-nb-cream">Productos destacados</h2>
            <p className="text-sm text-nb-beige/55 mt-2">
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

      {/* NUBARI EN TU HOGAR */}
      <section className="bg-nb-carbon py-28 border-y border-nb-line/60">
        <div className="container-nb grid md:grid-cols-2 gap-14 items-center">
          <div className="relative aspect-[4/5] overflow-hidden order-2 md:order-1">
            <Image src="/images/ambientes/living.svg" alt="Banqueta Nubari ambientada" fill className="object-cover opacity-85" />
          </div>
          <div className="order-1 md:order-2">
            <p className="text-[11px] tracking-widest2 text-nb-champagne mb-4">NUBARI EN TU HOGAR</p>
            <h2 className="font-serif text-4xl text-nb-cream leading-tight">
              Diseño que se vive
            </h2>
            <p className="mt-5 text-nb-beige/65 max-w-md">
              Cada pieza está pensada para integrarse naturalmente a tu espacio.
            </p>
            <Link
              href="/productos"
              className="inline-block mt-8 px-7 py-3 border border-nb-beige/40 text-nb-beige text-xs tracking-widest3 uppercase hover:border-nb-champagne hover:text-nb-champagne transition-colors"
            >
              Descubrir colección
            </Link>
          </div>
        </div>
      </section>

      {/* POR QUÉ ELEGIR NUBARI */}
      <section className="container-nb py-28">
        <h2 className="text-center font-serif text-3xl text-nb-cream mb-16">
          ¿Por qué elegir Nubari?
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {RAZONES.map((r) => (
            <div key={r.title} className="text-center">
              <p className="text-sm tracking-wide uppercase text-nb-champagne mb-2">{r.title}</p>
              <p className="text-sm text-nb-beige/55">{r.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
