import { Truck } from "lucide-react";

export default function TopBar() {
  return (
    <div className="hidden sm:block bg-nb-black text-nb-beige/80 border-b border-nb-line/60">
      <div className="container-nb flex items-center justify-between h-9 text-[11px] tracking-wide">
        <span className="flex items-center gap-2">
          <Truck size={13} className="text-nb-champagne" />
          Envíos a todo el país · Andreani &amp; Vía Cargo
        </span>
        <span>Hasta 6 cuotas sin interés</span>
      </div>
    </div>
  );
}
