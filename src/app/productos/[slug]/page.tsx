import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllProducts, getProductBySlug } from "@/lib/db/products";
import ProductDetailClient from "@/components/ProductDetailClient";

interface Props {
  params: { slug: string };
}

export function generateStaticParams() {
  return getAllProducts().map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const product = getProductBySlug(params.slug);
  if (!product) return {};
  return {
    title: product.nombre,
    description: product.descripcion,
    alternates: { canonical: `/productos/${product.slug}` },
    openGraph: {
      title: product.nombre,
      description: product.descripcion,
      images: product.imagenes,
    },
  };
}

export default function ProductoPage({ params }: Props) {
  const product = getProductBySlug(params.slug);
  if (!product || !product.activo) notFound();
  return <ProductDetailClient product={product} />;
}
