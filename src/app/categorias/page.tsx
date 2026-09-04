import Image from "next/image";
import Link from "next/link";
import { CATEGORY_LABELS } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Categorías" };

const CATEGORIES = [
  { key: "banquetas", img: "/images/categories/banquetas.svg" },
  { key: "organizacion", img: "/images/categories/organizacion.svg" },
  { key: "cocina", img: "/images/categories/cocina.svg" },
  { key: "hogar", img: "/images/categories/hogar.svg" },
  { key: "oficina", img: "/images/categories/oficina.svg" },
  { key: "novedades", img: "/images/categories/novedades.svg" },
];

export default function CategoriasPage() {
  return (
    <div className="container-nb py-16">
      <h1 className="font-serif text-4xl text-nb-cream mb-10">Categorías</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {CATEGORIES.map((c) => (
          <Link
            key={c.key}
            href={`/productos?categoria=${c.key}`}
            className="group relative aspect-[4/3] overflow-hidden bg-nb-card border border-nb-line/60"
          >
            <Image src={c.img} alt={CATEGORY_LABELS[c.key]} fill className="object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-nb-black/40 group-hover:bg-nb-black/25 transition-colors" />
            <span className="absolute bottom-4 left-4 text-nb-cream text-lg font-serif">
              {CATEGORY_LABELS[c.key]}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
