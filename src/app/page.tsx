import Link from "next/link";
import Image from "next/image";
import { queryProducts } from "@/lib/db/products";
import ProductCard from "@/components/ProductCard";
import { CATEGORY_LABELS } from "@/lib/utils";

const CATEGORIES: { key: string; img: string }[] = [
  { key: "banquetas", img: "/images/categories/banquetas.svg" },
  { key: "organizacion", img: "/images/categories/organizacion.svg" },
  { key: "cocina", img: "/images/categories/cocina.svg" },
  { key: "hogar", img: "/images/categories/hogar.svg" },
  { key: "oficina", img: "/images/categories/oficina.svg" },
  { key: "novedades", img: "/images/categories/novedades.svg" },
];

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const destacados = (
    await queryProducts({ ordenar: "destacados", soloDisponibles: false })
  ).slice(0, 8);

  return (
    <div>
      {/* HERO */}
      <section className="relative min-h-[88vh] flex items-end bg-nb-black text-nb-bone overflow-hidden">
        <div className="absolute inset-0 opacity-70">
          <Image
            src="/images/hero.svg"
            alt="Interior con muebles Nubari"
            fill
            priority
            className="object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-nb-black via-nb-black/50 to-transparent" />
        <div className="container-nb relative pb-20 pt-40">
          <p className="text-xs tracking-widest2 text-nb-rose mb-5">DISEÑO · ESTILO · HOGAR</p>
          <h1 className="font-serif text-6xl sm:text-7xl md:text-8xl leading-[0.95]">
            Nubari
          </h1>
          <p className="mt-6 font-serif italic text-2xl sm:text-3xl text-nb-bone/90 max-w-xl">
            Diseño que transforma tus espacios.
          </p>
          <p className="mt-4 text-nb-bone/60 max-w-md">
            Muebles funcionales con identidad propia.
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <Link
              href="/productos"
              className="px-7 py-3.5 bg-nb-bone text-nb-black text-sm hover:bg-nb-rose transition-colors duration-200 focus-ring"
            >
              Ver colección
            </Link>
            <Link
              href="/contacto"
              className="px-7 py-3.5 border border-nb-bone/50 text-sm hover:border-nb-rose hover:text-nb-rose transition-colors duration-200 focus-ring"
            >
              Comprar por WhatsApp
            </Link>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="container-nb py-24">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {CATEGORIES.map((c) => (
            <Link
              key={c.key}
              href={`/productos?categoria=${c.key}`}
              className="group relative aspect-square overflow-hidden bg-nb-sand"
            >
              <Image
                src={c.img}
                alt={CATEGORY_LABELS[c.key]}
                fill
                className="object-cover transition-transform duration-500 ease-soft group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-nb-black/25 group-hover:bg-nb-black/40 transition-colors duration-200" />
              <span className="absolute bottom-3 left-3 text-nb-bone text-sm tracking-wide">
                {CATEGORY_LABELS[c.key]}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="container-nb py-8 pb-28">
        <div className="flex items-end justify-between mb-10">
          <h2 className="font-serif text-3xl text-nb-black">Productos destacados</h2>
          <Link href="/productos" className="text-sm text-nb-wood hover:text-nb-roseDeep transition-colors">
            Ver todo →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
          {destacados.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* NUBARI EN TU HOGAR */}
      <section className="bg-nb-sand py-28">
        <div className="container-nb grid md:grid-cols-2 gap-14 items-center">
          <div>
            <h2 className="font-serif text-4xl text-nb-black leading-tight">
              Nubari en tu hogar
            </h2>
            <p className="mt-5 text-nb-stone max-w-md">
              Pensamos cada pieza para integrarse naturalmente a tus espacios.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-3">
              <div className="relative aspect-square overflow-hidden">
                <Image src="/images/ambientes/living.svg" alt="Banqueta en living" fill className="object-cover" />
              </div>
              <div className="relative aspect-square overflow-hidden mt-8">
                <Image src="/images/ambientes/dormitorio.svg" alt="Banqueta en dormitorio" fill className="object-cover" />
              </div>
            </div>
          </div>
          <div className="relative aspect-[4/5] overflow-hidden">
            <Image src="/images/ambientes/cocina.svg" alt="Organizadores en cocina" fill className="object-cover" />
          </div>
        </div>
      </section>

      {/* NOSOTROS TEASER */}
      <section className="container-nb py-28 max-w-2xl">
        <p className="text-xs tracking-widest2 text-nb-wood mb-4">NUESTRA ESENCIA</p>
        <p className="font-serif text-3xl text-nb-black leading-snug">
          Diseñamos muebles para vivirlos.
        </p>
        <p className="mt-5 text-nb-stone">
          La combinación de diseño, funcionalidad y materiales seleccionados da vida a
          piezas pensadas para acompañar cada espacio del hogar.
        </p>
        <Link href="/nosotros" className="inline-block mt-6 text-sm text-nb-wood hover:text-nb-roseDeep transition-colors">
          Conocer más →
        </Link>
      </section>
    </div>
  );
}
