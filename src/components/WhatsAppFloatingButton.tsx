import { MessageCircle } from "lucide-react";
import { buildWhatsAppLink } from "@/lib/utils";

export default function WhatsAppFloatingButton() {
  const href = buildWhatsAppLink("Hola, quiero hacer una consulta sobre Nubari.");
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Consultar por WhatsApp"
      className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 bg-nb-champagne text-nb-black px-4 py-3 rounded-full shadow-lg hover:bg-nb-gold transition-colors duration-200 focus-ring"
    >
      <MessageCircle size={18} strokeWidth={1.75} />
      <span className="hidden sm:inline text-sm font-medium">WhatsApp</span>
    </a>
  );
}
