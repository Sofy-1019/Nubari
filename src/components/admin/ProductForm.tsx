"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { Loader2, Trash2, Upload } from "lucide-react";
import type { Product, ProductCategory } from "@/lib/types";

const CATEGORIES: ProductCategory[] = [
  "banquetas",
  "organizacion",
  "cocina",
  "hogar",
  "oficina",
  "novedades",
];

interface Props {
  initial?: Product;
}

type FormState = {
  nombre: string;
  descripcion: string;
  categoria: ProductCategory;
  precio: string;
  precioAnterior: string;
  costo: string;
  sku: string;
  stock: string;
  destacado: boolean;
  nuevo: boolean;
  agotado: boolean;
  activo: boolean;
  imagenes: string[];
  diasFabricacion: string;
  color: string;
  material: string;
  medida: string;
  varianteStock: string;
  pesoKg: string;
  altoCm: string;
  anchoCm: string;
  largoCm: string;
  bultos: string;
  valorDeclarado: string;
  requiereCotizacionManual: boolean;
};

function fromProduct(p?: Product): FormState {
  const v = p?.variantes[0];
  return {
    nombre: p?.nombre || "",
    descripcion: p?.descripcion || "",
    categoria: p?.categoria || "banquetas",
    precio: p ? String(p.precio) : "",
    precioAnterior: p?.precioAnterior ? String(p.precioAnterior) : "",
    costo: p?.costo ? String(p.costo) : "",
    sku: p?.sku || "",
    stock: p ? String(p.stock) : "1",
    destacado: p?.destacado ?? false,
    nuevo: p?.nuevo ?? false,
    agotado: p?.agotado ?? false,
    activo: p?.activo ?? true,
    imagenes: p?.imagenes || [],
    diasFabricacion: p?.diasFabricacion ? String(p.diasFabricacion) : "",
    color: v?.color || "",
    material: v?.material || "",
    medida: v?.medida || "",
    varianteStock: v ? String(v.stock) : p ? String(p.stock) : "1",
    pesoKg: p ? String(p.logistica.pesoKg) : "",
    altoCm: p ? String(p.logistica.altoCm) : "",
    anchoCm: p ? String(p.logistica.anchoCm) : "",
    largoCm: p ? String(p.logistica.largoCm) : "",
    bultos: p ? String(p.logistica.bultos) : "1",
    valorDeclarado: p?.logistica.valorDeclarado ? String(p.logistica.valorDeclarado) : "",
    requiereCotizacionManual: p?.logistica.requiereCotizacionManual ?? false,
  };
}

export default function ProductForm({ initial }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(fromProduct(initial));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleFilesSelected(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      const body = new FormData();
      Array.from(fileList).forEach((file) => body.append("files", file));
      const res = await fetch("/api/upload", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudieron subir las fotos.");
        return;
      }
      set("imagenes", [...form.imagenes, ...data.urls]);
    } catch {
      setError("No se pudieron subir las fotos. Intentá nuevamente.");
    } finally {
      setUploading(false);
    }
  }

  function removeImage(index: number) {
    set(
      "imagenes",
      form.imagenes.filter((_, i) => i !== index)
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.nombre.trim() || !form.precio) {
      setError("Nombre y precio son obligatorios.");
      return;
    }

    const payload = {
      nombre: form.nombre,
      descripcion: form.descripcion,
      categoria: form.categoria,
      precio: Number(form.precio),
      precioAnterior: form.precioAnterior ? Number(form.precioAnterior) : undefined,
      costo: form.costo ? Number(form.costo) : undefined,
      sku: form.sku || `NB-${Date.now().toString().slice(-6)}`,
      stock: Number(form.stock || 0),
      destacado: form.destacado,
      nuevo: form.nuevo,
      agotado: form.agotado,
      activo: form.activo,
      esProductoDePrueba: initial?.esProductoDePrueba ?? false,
      diasFabricacion: form.diasFabricacion ? Number(form.diasFabricacion) : undefined,
      imagenes: form.imagenes.length > 0 ? form.imagenes : ["/images/products/placeholder.svg"],
      variantes: [
        {
          id: initial?.variantes[0]?.id || `${Date.now()}`,
          color: form.color || undefined,
          material: form.material || undefined,
          medida: form.medida || undefined,
          stock: Number(form.varianteStock || 0),
        },
      ],
      logistica: {
        pesoKg: Number(form.pesoKg || 0),
        altoCm: Number(form.altoCm || 0),
        anchoCm: Number(form.anchoCm || 0),
        largoCm: Number(form.largoCm || 0),
        bultos: Number(form.bultos || 1),
        valorDeclarado: Number(form.valorDeclarado || form.precio || 0),
        requiereCotizacionManual: form.requiereCotizacionManual,
        transportistasPermitidos: ["andreani", "via-cargo"] as const,
      },
    };

    setSaving(true);
    try {
      const res = await fetch(
        initial ? `/api/products/${initial.id}` : "/api/products",
        {
          method: initial ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "No se pudo guardar el producto.");
        return;
      }
      router.push("/admin/productos");
      router.refresh();
    } catch {
      setError("No se pudo guardar el producto.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
      <section>
        <h2 className="text-xs tracking-widest2 text-nb-taupe mb-4">DATOS GENERALES</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Nombre" span2>
            <input className="input" value={form.nombre} onChange={(e) => set("nombre", e.target.value)} />
          </Field>
          <Field label="Descripción" span2>
            <textarea
              className="input"
              rows={3}
              value={form.descripcion}
              onChange={(e) => set("descripcion", e.target.value)}
            />
          </Field>
          <Field label="Categoría">
            <select className="input" value={form.categoria} onChange={(e) => set("categoria", e.target.value as ProductCategory)}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="SKU">
            <input className="input" value={form.sku} onChange={(e) => set("sku", e.target.value)} placeholder="Se genera automáticamente si se deja vacío" />
          </Field>
          <Field label="Precio">
            <input className="input" type="number" value={form.precio} onChange={(e) => set("precio", e.target.value)} />
          </Field>
          <Field label="Precio anterior (opcional)">
            <input className="input" type="number" value={form.precioAnterior} onChange={(e) => set("precioAnterior", e.target.value)} />
          </Field>
          <Field label="Costo (opcional)">
            <input className="input" type="number" value={form.costo} onChange={(e) => set("costo", e.target.value)} />
          </Field>
          <Field label="Stock total (uso interno, el cliente no lo ve)">
            <input className="input" type="number" value={form.stock} onChange={(e) => set("stock", e.target.value)} />
          </Field>
          <Field label="Demora de fabricación (días hábiles)">
            <input
              className="input"
              type="number"
              min="0"
              value={form.diasFabricacion}
              onChange={(e) => set("diasFabricacion", e.target.value)}
              placeholder="Ej: 7"
            />
          </Field>
        </div>
        <div className="flex flex-wrap gap-5 mt-4">
          <Checkbox label="Destacado" checked={form.destacado} onChange={(v) => set("destacado", v)} />
          <Checkbox label="Nuevo" checked={form.nuevo} onChange={(v) => set("nuevo", v)} />
          <Checkbox label="Agotado" checked={form.agotado} onChange={(v) => set("agotado", v)} />
          <Checkbox label="Activo" checked={form.activo} onChange={(v) => set("activo", v)} />
        </div>
      </section>

      <section>
        <h2 className="text-xs tracking-widest2 text-nb-taupe mb-4">FOTOS DEL PRODUCTO</h2>
        <div className="flex flex-wrap gap-3 mb-3">
          {form.imagenes.map((img, i) => (
            <div key={img + i} className="relative w-24 h-24 border border-nb-black/15 overflow-hidden group">
              <Image src={img} alt="" fill className="object-cover" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 bg-nb-black/70 text-nb-bone p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Quitar foto"
              >
                <Trash2 size={12} />
              </button>
              {i === 0 && (
                <span className="absolute bottom-0 inset-x-0 bg-nb-black/70 text-nb-bone text-[10px] text-center py-0.5">
                  Principal
                </span>
              )}
            </div>
          ))}
          <label className="w-24 h-24 border border-dashed border-nb-black/30 flex flex-col items-center justify-center gap-1 text-nb-taupe text-xs cursor-pointer hover:border-nb-wood hover:text-nb-wood transition-colors">
            {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
            <span>{uploading ? "Subiendo…" : "Agregar"}</span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              disabled={uploading}
              onChange={(e) => {
                handleFilesSelected(e.target.files);
                e.target.value = "";
              }}
            />
          </label>
        </div>
        <p className="text-xs text-nb-taupe">
          La primera foto es la que se muestra en el catálogo. Podés subir varias y sacarlas
          arrastrando el mouse encima y tocando la papelera.
        </p>
      </section>

      <section>
        <h2 className="text-xs tracking-widest2 text-nb-taupe mb-4">VARIANTE PRINCIPAL</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <Field label="Color">
            <input className="input" value={form.color} onChange={(e) => set("color", e.target.value)} />
          </Field>
          <Field label="Material">
            <input className="input" value={form.material} onChange={(e) => set("material", e.target.value)} />
          </Field>
          <Field label="Medida">
            <input className="input" value={form.medida} onChange={(e) => set("medida", e.target.value)} />
          </Field>
          <Field label="Stock de esta variante">
            <input className="input" type="number" value={form.varianteStock} onChange={(e) => set("varianteStock", e.target.value)} />
          </Field>
        </div>
        <p className="text-xs text-nb-taupe mt-2">
          Para múltiples variantes (color/material/medida), editá el producto vía API o
          ampliá este formulario — la estructura de datos ya soporta N variantes por producto.
        </p>
      </section>

      <section>
        <h2 className="text-xs tracking-widest2 text-nb-taupe mb-4">DATOS LOGÍSTICOS</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <Field label="Peso (kg)">
            <input className="input" type="number" step="0.1" value={form.pesoKg} onChange={(e) => set("pesoKg", e.target.value)} />
          </Field>
          <Field label="Alto (cm)">
            <input className="input" type="number" value={form.altoCm} onChange={(e) => set("altoCm", e.target.value)} />
          </Field>
          <Field label="Ancho (cm)">
            <input className="input" type="number" value={form.anchoCm} onChange={(e) => set("anchoCm", e.target.value)} />
          </Field>
          <Field label="Largo (cm)">
            <input className="input" type="number" value={form.largoCm} onChange={(e) => set("largoCm", e.target.value)} />
          </Field>
          <Field label="Cantidad de bultos">
            <input className="input" type="number" value={form.bultos} onChange={(e) => set("bultos", e.target.value)} />
          </Field>
          <Field label="Valor declarado">
            <input className="input" type="number" value={form.valorDeclarado} onChange={(e) => set("valorDeclarado", e.target.value)} placeholder="Por defecto, el precio" />
          </Field>
        </div>
        <div className="mt-4">
          <Checkbox
            label="Requiere cotización manual (producto muy grande)"
            checked={form.requiereCotizacionManual}
            onChange={(v) => set("requiereCotizacionManual", v)}
          />
        </div>
      </section>

      {error && <p className="text-sm text-red-700">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="px-6 py-3 bg-nb-black text-nb-bone text-sm hover:bg-nb-ink transition-colors disabled:opacity-50"
      >
        {saving ? "Guardando…" : initial ? "Guardar cambios" : "Crear producto"}
      </button>

      <style jsx global>{`
        .input {
          width: 100%;
          padding: 0.6rem 0.75rem;
          border: 1px solid rgba(15, 14, 13, 0.2);
          background: white;
          font-size: 0.875rem;
        }
        .input:focus {
          outline: none;
          border-color: #a9713f;
        }
      `}</style>
    </form>
  );
}

function Field({ label, children, span2 }: { label: string; children: React.ReactNode; span2?: boolean }) {
  return (
    <div className={span2 ? "sm:col-span-2" : ""}>
      <label className="block text-xs text-nb-taupe mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-nb-ink">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}
