import { MessageCircle, Mail, MapPin } from "lucide-react";
import { buildWhatsAppLink } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Contacto" };

export default function ContactoPage() {
  return (
    <div className="container-nb py-20 max-w-xl">
      <h1 className="font-serif text-4xl text-nb-black mb-8">Contacto</h1>
      <div className="space-y-5 text-nb-stone">
        <a
          href={buildWhatsAppLink("Hola, quiero hacer una consulta sobre Nubari.")}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 hover:text-nb-wood transition-colors"
        >
          <MessageCircle size={18} /> Escribinos por WhatsApp
        </a>
        <a href="mailto:hola@nubari.com.ar" className="flex items-center gap-3 hover:text-nb-wood transition-colors">
          <Mail size={18} /> hola@nubari.com.ar
        </a>
        <p className="flex items-center gap-3">
          <MapPin size={18} /> Berazategui, Buenos Aires, Argentina
        </p>
      </div>
    </div>
  );
}
