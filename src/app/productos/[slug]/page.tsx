import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductBySlug } from "@/lib/db/products";
import ProductDetailClient from "@/components/ProductDetailClient";

interface Props {
  params: { slug: string };
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
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

export default async function ProductoPage({ params }: Props) {
  const product = await getProductBySlug(params.slug);
  if (!product || !product.activo) notFound();
  return <ProductDetailClient product={product} />;
}
