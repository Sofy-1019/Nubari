import { queryProducts } from "@/lib/db/products";
import ProductCard from "@/components/ProductCard";
import { CATEGORY_LABELS } from "@/lib/utils";
import type { Metadata } from "next";
import type { ProductCategory } from "@/lib/types";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Productos",
  description: "Catálogo completo de muebles y decoración Nubari.",
};

const CATEGORIES: ProductCategory[] = [
  "banquetas",
  "organizacion",
  "cocina",
  "hogar",
  "oficina",
  "novedades",
];

const ORDER_OPTIONS: { value: string; label: string }[] = [
  { value: "destacados", label: "Destacados" },
  { value: "mas-vendidos", label: "Más vendidos" },
  { value: "precio-asc", label: "Precio: menor a mayor" },
  { value: "precio-desc", label: "Precio: mayor a menor" },
  { value: "novedades", label: "Novedades" },
];

interface Props {
  searchParams: {
    categoria?: string;
    precioMin?: string;
    precioMax?: string;
    color?: string;
    material?: string;
    ordenar?: string;
  };
}

export const dynamic = "force-dynamic";

export default async function ProductosPage({ searchParams }: Props) {
  const categoria = searchParams.categoria as ProductCategory | undefined;
  const products = await queryProducts({
    categoria,
    precioMin: searchParams.precioMin ? Number(searchParams.precioMin) : undefined,
    precioMax: searchParams.precioMax ? Number(searchParams.precioMax) : undefined,
    color: searchParams.color,
    material: searchParams.material,
    ordenar: (searchParams.ordenar as any) || "destacados",
  });

  function buildLink(next: Partial<typeof searchParams>) {
    const params = new URLSearchParams({ ...searchParams, ...next } as Record<string, string>);
    Object.keys(next).forEach((k) => {
      if (!next[k as keyof typeof next]) params.delete(k);
    });
    return `/productos?${params.toString()}`;
  }

  return (
    <div className="container-nb py-14">
      <div className="mb-10">
        <h1 className="font-serif text-4xl text-nb-cream">
          {categoria ? CATEGORY_LABELS[categoria] : "Todos los productos"}
        </h1>
        <p className="text-nb-beige/50 mt-2">{products.length} productos</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-12">
        <aside className="space-y-8">
          <div>
            <p className="text-[11px] tracking-widest3 uppercase text-nb-beige/45 mb-3">Categoría</p>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href={buildLink({ categoria: undefined })}
                  className={!categoria ? "text-nb-champagne" : "text-nb-beige/70 hover:text-nb-champagne"}
                >
                  Todas
                </Link>
              </li>
              {CATEGORIES.map((c) => (
                <li key={c}>
                  <Link
                    href={buildLink({ categoria: c })}
                    className={categoria === c ? "text-nb-champagne" : "text-nb-beige/70 hover:text-nb-champagne"}
                  >
                    {CATEGORY_LABELS[c]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[11px] tracking-widest3 uppercase text-nb-beige/45 mb-3">Ordenar por</p>
            <ul className="space-y-2 text-sm">
              {ORDER_OPTIONS.map((o) => (
                <li key={o.value}>
                  <Link
                    href={buildLink({ ordenar: o.value })}
                    className={
                      (searchParams.ordenar || "destacados") === o.value
                        ? "text-nb-champagne"
                        : "text-nb-beige/70 hover:text-nb-champagne"
                    }
                  >
                    {o.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <div>
          {products.length === 0 ? (
            <p className="text-nb-beige/50">No encontramos productos con estos filtros.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-12">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
