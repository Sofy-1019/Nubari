import fs from "fs";
import path from "path";
import type { CarrierConfig } from "@/lib/types";

function getConfig(): CarrierConfig[] {
  const file = path.join(process.cwd(), "data", "shipping-rules.json");
  return JSON.parse(fs.readFileSync(file, "utf-8")).carriers;
}

export default function AdminEnviosPage() {
  const carriers = getConfig();

  return (
    <div>
      <h1 className="font-serif text-3xl text-nb-cream mb-3">Configuración de envíos</h1>
      <p className="text-sm text-nb-beige/55 mb-8 max-w-xl">
        Esta configuración vive en <code className="text-nb-champagne">data/shipping-rules.json</code>.
      </p>

      <div className="space-y-4 max-w-xl">
        {carriers.map((c) => (
          <div key={c.id} className="border border-nb-line/60 bg-nb-card p-5 flex items-center justify-between">
            <div>
              <p className="text-base text-nb-cream">{c.nombre}</p>
              <p className="text-sm text-nb-beige/55 mt-1">
                {c.usaApiReal ? "Usando API real" : "Usando cotización mock"} · Límite{" "}
                {c.limitePesoKg ?? "—"} kg / {c.limiteVolumenM3 ?? "—"} m³
              </p>
            </div>
            <span
              className={`text-xs px-2.5 py-1 rounded-sm ${
                c.activo ? "bg-green-900/40 text-green-300" : "bg-nb-black/40 text-nb-beige/50"
              }`}
            >
              {c.activo ? "Activo" : "Inactivo"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
