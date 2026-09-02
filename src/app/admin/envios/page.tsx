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
      <h1 className="font-serif text-3xl text-nb-black mb-3">Configuración de envíos</h1>
      <p className="text-sm text-nb-stone mb-8 max-w-xl">
        Esta configuración vive en <code>data/shipping-rules.json</code>. Editá ese archivo
        para activar/desactivar transportistas o ajustar límites de peso y volumen; los
        cambios se reflejan automáticamente en el cotizador.
      </p>

      <div className="space-y-4 max-w-xl">
        {carriers.map((c) => (
          <div key={c.id} className="border border-nb-black/10 p-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-nb-black">{c.nombre}</p>
              <p className="text-xs text-nb-stone mt-1">
                {c.usaApiReal ? "Usando API real" : "Usando cotización mock (sin credenciales)"} ·
                {" "}Límite {c.limitePesoKg ?? "—"} kg / {c.limiteVolumenM3 ?? "—"} m³
              </p>
            </div>
            <span
              className={`text-xs px-2.5 py-1 ${
                c.activo ? "bg-green-100 text-green-800" : "bg-nb-sand text-nb-stone"
              }`}
            >
              {c.activo ? "Activo" : "Inactivo"}
            </span>
          </div>
        ))}
      </div>

      <p className="text-sm text-nb-stone mt-8 max-w-xl">
        Para conectar credenciales reales de Andreani o Vía Cargo, completá las variables de
        entorno correspondientes (ver <code>.env.example</code>). El sistema detecta
        automáticamente cuándo hay credenciales configuradas y deja de usar los datos mock.
      </p>
    </div>
  );
}
