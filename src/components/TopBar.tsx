import { Truck, CreditCard, Sparkles } from "lucide-react";

const ITEMS = [
  { icon: Truck, text: "Envíos a todo el país" },
  { icon: CreditCard, text: "6 cuotas sin interés" },
  { icon: Sparkles, text: "Diseño que se vive" },
];

export default function TopBar() {
  return (
    <div className="hidden sm:block bg-nb-carbon text-nb-beige border-b border-nb-line/70">
      <div className="container-nb flex items-center justify-center gap-10 h-9 text-[11px] tracking-wide">
        {ITEMS.map(({ icon: Icon, text }) => (
          <span key={text} className="flex items-center gap-2">
            <Icon size={13} className="text-nb-champagne" />
            {text}
          </span>
        ))}
      </div>
    </div>
  );
}
