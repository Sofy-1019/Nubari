import { notFound } from "next/navigation";
import { getProductById } from "@/lib/db/products";
import ProductForm from "@/components/admin/ProductForm";

export default async function EditarProductoPage({ params }: { params: { id: string } }) {
  const product = await getProductById(params.id);
  if (!product) notFound();

  return (
    <div>
      <h1 className="font-serif text-3xl text-nb-black mb-8">Editar producto</h1>
      <ProductForm initial={product} />
    </div>
  );
}
