import Link from "next/link";

export default function ConfirmacionPage({
  searchParams,
}: {
  searchParams: { numero?: string };
}) {
  return (
    <div className="container-nb py-32 text-center max-w-lg mx-auto">
      <h1 className="font-serif text-3xl text-nb-black mb-4">¡Gracias por tu compra!</h1>
      <p className="text-nb-stone">
        Registramos tu pedido {searchParams.numero && <strong>#{searchParams.numero}</strong>}.
        Te vamos a contactar por email o WhatsApp para coordinar el pago y la entrega.
      </p>
      <Link
        href="/productos"
        className="inline-block mt-8 text-sm text-nb-wood hover:text-nb-roseDeep transition-colors"
      >
        Seguir viendo productos →
      </Link>
    </div>
  );
}
