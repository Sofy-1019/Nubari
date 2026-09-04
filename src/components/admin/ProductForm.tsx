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

type FormVariant = {
  id: string;
  color: string;
  material: string;
  medida: string;
  stock: string;
  priceDelta: string;
};

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
  variantes: FormVariant[];
  pesoKg: string;
  altoCm: string;
  anchoCm: string;
  largoCm: string;
  bultos: string;
  valorDeclarado: string;
  requiereCotizacionManual: boolean;
};

function fromProduct(p?: Product): FormState {
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
    variantes:
      p && p.variantes.length > 0
        ? p.variantes.map((v) => ({
            id: v.id,
            color: v.color || "",
            material: v.material || "",
            medida: v.medida || "",
            stock: String(v.stock),
            priceDelta: v.priceDelta ? String(v.priceDelta) : "",
          }))
        : [{ id: `${Date.now()}`, color: "", material: "", medida: "", stock: "1", priceDelta: "" }],
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
    set("imagenes", form.imagenes.filter((_, i) => i !== index));
  }

  function updateVariant(id: string, patch: Partial<FormVariant>) {
    set("variantes", form.variantes.map((v) => (v.id === id ? { ...v, ...patch } : v)));
  }

  function addVariant() {
    set("variantes", [
      ...form.variantes,
      { id: `${Date.now()}`, color: "", material: "", medida: "", stock: "1", priceDelta: "" },
    ]);
  }

  function removeVariant(id: string) {
    if (form.variantes.length <= 1) return;
    set("variantes", form.variantes.filter((v) => v.id !== id));
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
      variantes: form.variantes.map((v) => ({
        id: v.id,
        color: v.color || undefined,
        material: v.material || undefined,
        medida: v.medida || undefined,
        stock: Number(v.stock || 0),
        priceDelta: v.priceDelta ? Number(v.priceDelta) : undefined,
      })),
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
      const res = await fetch(initial ? `/api/products/${initial.id}` : "/api/products", {
        method: initial ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
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
    <form onSubmit={handleSubmit} className="space-y-10 max-w-2xl">
      <section>
        <h2 className="text-sm tracking-widest3 uppercase text-nb-champagne mb-5">Datos generales</h2>
        <div className="grid sm:grid-cols-2 gap-5">
          <Field label="Nombre" span2>
            <input className="input" value={form.nombre} onChange={(e) => set("nombre", e.target.value)} />
          </Field>
          <Field label="Descripción" span2>
            <textarea className="input" rows={3} value={form.descripcion} onChange={(e) => set("descripcion", e.target.value)} />
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
            <input className="input" type="number" min="0" value={form.diasFabricacion} onChange={(e) => set("diasFabricacion", e.target.value)} placeholder="Ej: 7" />
          </Field>
        </div>
        <div className="flex flex-wrap gap-6 mt-5">
          <Checkbox label="Destacado" checked={form.destacado} onChange={(v) => set("destacado", v)} />
          <Checkbox label="Nuevo" checked={form.nuevo} onChange={(v) => set("nuevo", v)} />
          <Checkbox label="Agotado" checked={form.agotado} onChange={(v) => set("agotado", v)} />
          <Checkbox label="Activo" checked={form.activo} onChange={(v) => set("activo", v)} />
        </div>
      </section>

      <section>
        <h2 className="text-sm tracking-widest3 uppercase text-nb-champagne mb-2">Fotos del producto</h2>
        <div className="flex flex-wrap gap-3 mb-3">
          {form.imagenes.map((img, i) => (
            <div key={img + i} className="relative w-24 h-24 border border-nb-line/60 overflow-hidden group">
              <Image src={img} alt="" fill className="object-cover" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 bg-nb-black/80 text-nb-cream p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Quitar foto"
              >
                <Trash2 size={12} />
              </button>
              {i === 0 && (
                <span className="absolute bottom-0 inset-x-0 bg-nb-black/80 text-nb-champagne text-[10px] text-center py-0.5">
                  Principal
                </span>
              )}
            </div>
          ))}
          <label className="w-24 h-24 border border-dashed border-nb-champagne/40 flex flex-col items-center justify-center gap-1 text-nb-champagne text-xs cursor-pointer hover:border-nb-champagne hover:bg-nb-champagne/10 transition-colors">
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
        <p className="text-sm text-nb-beige/55">
          La primera foto es la que se muestra en el catálogo. Podés subir varias y sacarlas
          pasando el mouse por encima y tocando la papelera.
        </p>
      </section>

      <section>
        <h2 className="text-sm tracking-widest3 uppercase text-nb-champagne mb-2">
          Variantes (color / material)
        </h2>
        <p className="text-sm text-nb-beige/55 mb-5">
          Agregá una fila por cada opción que el cliente pueda elegir. Si una opción cuesta
          más (por ejemplo, un color con pintura especial), cargá esa diferencia en
          "Precio extra" — se suma automáticamente al precio base cuando el cliente la elige.
        </p>
        <div className="space-y-4">
          {form.variantes.map((v) => (
            <div key={v.id} className="border border-nb-line/60 bg-nb-card p-4">
              <div className="grid sm:grid-cols-5 gap-3">
                <Field label="Color">
                  <input className="input" value={v.color} onChange={(e) => updateVariant(v.id, { color: e.target.value })} placeholder="Ej: Blanco" />
                </Field>
                <Field label="Material">
                  <input className="input" value={v.material} onChange={(e) => updateVariant(v.id, { material: e.target.value })} />
                </Field>
                <Field label="Medida">
                  <input className="input" value={v.medida} onChange={(e) => updateVariant(v.id, { medida: e.target.value })} />
                </Field>
                <Field label="Stock">
                  <input className="input" type="number" value={v.stock} onChange={(e) => updateVariant(v.id, { stock: e.target.value })} />
                </Field>
                <Field label="Precio extra">
                  <input className="input" type="number" value={v.priceDelta} onChange={(e) => updateVariant(v.id, { priceDelta: e.target.value })} placeholder="0" />
                </Field>
              </div>
              {form.variantes.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeVariant(v.id)}
                  className="mt-3 text-sm text-nb-beige/55 hover:text-red-400 transition-colors flex items-center gap-1"
                >
                  <Trash2 size={13} /> Quitar esta variante
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addVariant}
          className="mt-4 text-sm text-nb-champagne hover:text-nb-gold transition-colors"
        >
          + Agregar otra variante
        </button>
      </section>

      <section>
        <h2 className="text-sm tracking-widest3 uppercase text-nb-champagne mb-5">Datos logísticos</h2>
        <div className="grid sm:grid-cols-3 gap-5">
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
        <div className="mt-5">
          <Checkbox
            label="Requiere cotización manual (producto muy grande)"
            checked={form.requiereCotizacionManual}
            onChange={(v) => set("requiereCotizacionManual", v)}
          />
        </div>
      </section>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="px-7 py-3.5 bg-nb-champagne text-nb-black text-sm font-medium hover:bg-nb-gold transition-colors disabled:opacity-50"
      >
        {saving ? "Guardando…" : initial ? "Guardar cambios" : "Crear producto"}
      </button>

      <style jsx global>{`
        .input {
          width: 100%;
          padding: 0.7rem 0.85rem;
          border: 1px solid #332e28;
          background: rgba(11, 10, 9, 0.5);
          color: #f7f2ea;
          font-size: 0.95rem;
        }
        .input::placeholder {
          color: rgba(233, 224, 209, 0.35);
        }
        .input:focus {
          outline: none;
          border-color: #c9a15a;
        }
      `}</style>
    </form>
  );
}

function Field({ label, children, span2 }: { label: string; children: React.ReactNode; span2?: boolean }) {
  return (
    <div className={span2 ? "sm:col-span-2" : ""}>
      <label className="block text-sm text-nb-beige/70 mb-2">{label}</label>
      {children}
    </div>
  );
}

function Checkbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2.5 text-sm text-nb-beige/85">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="w-4 h-4 accent-[#c9a15a]" />
      {label}
    </label>
  );
}
