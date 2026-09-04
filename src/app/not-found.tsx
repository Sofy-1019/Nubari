import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-nb py-32 text-center">
      <h1 className="font-serif text-4xl text-nb-cream mb-4">Página no encontrada</h1>
      <p className="text-nb-beige/55 mb-8">El contenido que buscás no existe o fue movido.</p>
      <Link href="/" className="text-nb-champagne hover:text-nb-gold transition-colors">
        Volver al inicio →
      </Link>
    </div>
  );
}
