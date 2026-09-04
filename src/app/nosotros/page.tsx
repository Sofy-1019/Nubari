import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nosotros",
  description: "Conocé la esencia de Nubari, diseño y hogar.",
};

export default function NosotrosPage() {
  return (
    <div className="container-nb py-20 grid md:grid-cols-2 gap-16 items-center">
      <div className="relative aspect-[4/5] overflow-hidden border border-nb-line/50">
        <Image src="/images/ambientes/living.svg" alt="Ambiente Nubari" fill className="object-cover opacity-85" />
      </div>
      <div>
        <p className="text-[11px] tracking-widest2 text-nb-champagne mb-4">NUESTRA ESENCIA</p>
        <h1 className="font-serif text-4xl text-nb-cream leading-tight">
          Diseñamos muebles para vivirlos.
        </h1>
        <p className="mt-6 text-nb-beige/65 leading-relaxed">
          La combinación de diseño, funcionalidad y materiales seleccionados da vida a
          piezas pensadas para acompañar cada espacio del hogar.
        </p>
      </div>
    </div>
  );
}
