"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { ChevronDown, Loader2, Plus, Trash2, Upload } from "lucide-react";
import type { Product, ProductCategory, TelaTipo } from "@/lib/types";
import { uploadImageToCloudinary } from "@/lib/cloudinary";

const CATEGORIES: ProductCategory[] = [
  "banquetas",
  "organizacion",
  "cocina",
  "hogar",
  "oficina",
  "novedades",
];

const COLORES_ESTRUCTURA = ["Negro", "Blanco", "Dorado"] as const;
const TERMINACION = "Satinado";
const LARGOS_DISPONIBLES = [80, 100, 120] as const;

const TELA_LABELS: Record<TelaTipo, string> = {
  pana: "Pana",
  "simil-cuero": "Símil cuero",
};

interface Props {
  initial?: Product;
}

type FormVariant = {
  id: string;
  color: string;
  priceDelta: string;
};

type FormTelaColor = {
  id: string;
  nombre: string;
  hex: string;
  imagen?: string;
};

type FormTela = {
  tipo: TelaTipo;
  colores: FormTelaColor[];
};

type FormLargo = {
  cm: number;
  priceDelta: string;
};

type FormState = {
  nombre: string;
  descripcion: string;
  categoria: ProductCategory;
  precio: string;
  costo: string;
  destacado: boolean;
  nuevo: boolean;
  agotado: boolean;
  activo: boolean;
  imagenes: string[];
  diasFabricacion: string;
  mercadoPagoLink: string;
  variantes: FormVariant[];
  telas: FormTela[];
  multiplesLargos: boolean;
  largos: FormLargo[];
  altoCm: string;
  anchoCm: string;
  largoCm: string;
  pesoKg: string;
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
    costo: p?.costo ? String(p.costo) : "",
    destacado: p?.destacado ?? false,
    nuevo: p?.nuevo ?? false,
    agotado: p?.agotado ?? false,
    activo: p?.activo ?? true,
    imagenes: p?.imagenes || [],
    diasFabricacion: p?.diasFabricacion ? String(p.diasFabricacion) : "",
    mercadoPagoLink: p?.mercadoPagoLink || "",
    variantes:
      p && p.variantes.length > 0
        ? p.variantes.map((v) => ({
            id: v.id,
            color: v.color || COLORES_ESTRUCTURA[0],
            priceDelta: v.priceDelta ? String(v.priceDelta) : "",
          }))
        : [{ id: `${Date.now()}`, color: COLORES_ESTRUCTURA[0], priceDelta: "" }],
    telas: p?.telas
      ? p.telas.map((t) => ({
          tipo: t.tipo,
          colores: t.colores.map((c) => ({ id: c.id, nombre: c.nombre, hex: c.hex, imagen: c.imagen })),
        }))
      : [],
    altoCm: p ? String(p.logistica.altoCm) : "",
    anchoCm: p ? String(p.logistica.anchoCm) : "",
    largoCm: p ? String(p.logistica.largoCm) : "",
    multiplesLargos: (p?.largos?.length ?? 0) > 0,
    largos: p?.largos?.length
      ? p.largos.map((m) => ({ cm: m.cm, priceDelta: m.priceDelta ? String(m.priceDelta) : "" }))
      : [],
    pesoKg: p ? String(p.logistica.pesoKg) : "",
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
  const [uploadingSwatch, setUploadingSwatch] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showLogistica, setShowLogistica] = useState(false);
  const [showTelas, setShowTelas] = useState((initial?.telas?.length ?? 0) > 0);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleFilesSelected(files: File[]) {
    if (files.length === 0) {
      window.alert("No se detectó ningún archivo seleccionado.");
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const urls: string[] = [];
      for (const file of files) {
        const url = await uploadImageToCloudinary(file);
        urls.push(url);
      }
      set("imagenes", [...form.imagenes, ...urls]);
    } catch (err) {
      const msg =
        "No se pudieron subir las fotos. Detalle técnico: " +
        (err instanceof Error ? err.message : String(err));
      setError(msg);
      window.alert(msg);
    } finally {
      setUploading(false);
    }
  }

  function removeImage(index: number) {
    set("imagenes", form.imagenes.filter((_, i) => i !== index));
  }

  function setAsPortada(index: number) {
    if (index === 0) return;
    const nuevas = [...form.imagenes];
    const [elegida] = nuevas.splice(index, 1);
    nuevas.unshift(elegida);
    set("imagenes", nuevas);
  }

  function updateVariant(id: string, patch: Partial<FormVariant>) {
    set("variantes", form.variantes.map((v) => (v.id === id ? { ...v, ...patch } : v)));
  }

  function addVariant() {
    const usados = new Set(form.variantes.map((v) => v.color));
    const siguiente = COLORES_ESTRUCTURA.find((c) => !usados.has(c)) || COLORES_ESTRUCTURA[0];
    set("variantes", [...form.variantes, { id: `${Date.now()}`, color: siguiente, priceDelta: "" }]);
  }

  function removeVariant(id: string) {
    if (form.variantes.length <= 1) return;
    set("variantes", form.variantes.filter((v) => v.id !== id));
  }

  // ---- Largos ----
  function toggleLargo(cm: number) {
    const existe = form.largos.some((l) => l.cm === cm);
    if (existe) {
      set("largos", form.largos.filter((l) => l.cm !== cm));
    } else {
      set("largos", [...form.largos, { cm, priceDelta: "" }].sort((a, b) => a.cm - b.cm));
    }
  }

  function updateLargoPrecio(cm: number, priceDelta: string) {
    set("largos", form.largos.map((l) => (l.cm === cm ? { ...l, priceDelta } : l)));
  }

  // ---- Telas ----
  function toggleTela(tipo: TelaTipo) {
    const existe = form.telas.some((t) => t.tipo === tipo);
    if (existe) {
      set("telas", form.telas.filter((t) => t.tipo !== tipo));
    } else {
      set("telas", [...form.telas, { tipo, colores: [] }]);
    }
  }

  function addColorTela(tipo: TelaTipo) {
    set(
      "telas",
      form.telas.map((t) =>
        t.tipo === tipo
          ? { ...t, colores: [...t.colores, { id: `${Date.now()}`, nombre: "", hex: "#8a7a63" }] }
          : t
      )
    );
  }

  function updateColorTela(tipo: TelaTipo, id: string, patch: Partial<FormTelaColor>) {
    set(
      "telas",
      form.telas.map((t) =>
        t.tipo === tipo
          ? { ...t, colores: t.colores.map((c) => (c.id === id ? { ...c, ...patch } : c)) }
          : t
      )
    );
  }

  function removeColorTela(tipo: TelaTipo, id: string) {
    set(
      "telas",
      form.telas.map((t) => (t.tipo === tipo ? { ...t, colores: t.colores.filter((c) => c.id !== id) } : t))
    );
  }

  async function handleSwatchPhoto(tipo: TelaTipo, id: string, file: File) {
    setUploadingSwatch(id);
    try {
      const url = await uploadImageToCloudinary(file);
      updateColorTela(tipo, id, { imagen: url });
    } catch (err) {
      window.alert(
        "No se pudo subir la foto de la tela. " + (err instanceof Error ? err.message : String(err))
      );
    } finally {
      setUploadingSwatch(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.nombre.trim()) {
      setError("Falta el nombre del producto.");
      return;
    }
    if (!form.precio || Number(form.precio) <= 0) {
      setError("Falta el precio de venta (tiene que ser mayor a $0).");
      return;
    }
    if (form.imagenes.length === 0) {
      setError("Agregá al menos una foto del producto.");
      return;
    }
    if (form.multiplesLargos && form.largos.length === 0) {
      setError("Elegí al menos un largo (80, 100 o 120 cm), o desactivá \"Varios largos\".");
      return;
    }

    const payload = {
      nombre: form.nombre,
      descripcion: form.descripcion,
      categoria: form.categoria,
      precio: Number(form.precio),
      costo: form.costo ? Number(form.costo) : undefined,
      sku: `NB-${Date.now().toString().slice(-6)}`,
      stock: 9999,
      destacado: form.destacado,
      nuevo: form.nuevo,
      agotado: form.agotado,
      activo: form.activo,
      esProductoDePrueba: initial?.esProductoDePrueba ?? false,
      diasFabricacion: form.diasFabricacion ? Number(form.diasFabricacion) : undefined,
      mercadoPagoLink: form.mercadoPagoLink.trim() || undefined,
      imagenes: form.imagenes,
      variantes: form.variantes.map((v) => ({
        id: v.id,
        color: v.color,
        material: TERMINACION,
        stock: 9999,
        priceDelta: v.priceDelta ? Number(v.priceDelta) : undefined,
      })),
      telas: form.telas
        .filter((t) => t.colores.length > 0)
        .map((t) => ({
          tipo: t.tipo,
          colores: t.colores
            .filter((c) => c.nombre.trim())
            .map((c) => ({ id: c.id, nombre: c.nombre, hex: c.hex, imagen: c.imagen })),
        })),
      largos: form.multiplesLargos
        ? form.largos.map((l) => ({
            id: `largo-${l.cm}`,
            cm: l.cm,
            priceDelta: l.priceDelta ? Number(l.priceDelta) : undefined,
          }))
        : undefined,
      logistica: {
        pesoKg: Number(form.pesoKg || 0),
        altoCm: Number(form.altoCm || 0),
        anchoCm: Number(form.anchoCm || 0),
        largoCm: form.multiplesLargos
          ? Math.max(...form.largos.map((l) => l.cm), 0)
          : Number(form.largoCm || 0),
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
        const data = await res.json().catch(() => null);
        setError(
          (data?.error || "No se pudo guardar el producto.") +
            (data?.detail ? ` (${data.detail})` : "")
        );
        return;
      }
      router.push("/admin/productos");
      router.refresh();
    } catch (err) {
      setError(
        "No se pudo guardar el producto. Revisá tu conexión a internet. " +
          (err instanceof Error ? err.message : "")
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10 max-w-2xl">
      {/* PASO 1: FOTOS — primero, como en Mercado Libre */}
      <section>
        <div className="flex items-center gap-2 mb-2">
          <span className="w-6 h-6 rounded-full bg-nb-champagne text-nb-black text-xs font-bold flex items-center justify-center flex-shrink-0">1</span>
          <h2 className="text-sm tracking-widest3 uppercase text-nb-champagne">Fotos del producto</h2>
        </div>
        <p className="text-sm text-nb-beige/70 mb-4">
          Sacale varias fotos con buena luz. La primera es la que ve el cliente en el catálogo.
        </p>
        <div className="flex flex-wrap gap-3 mb-3">
          {form.imagenes.map((img, i) => (
            <div
              key={img + i}
              className={`relative w-24 h-24 border overflow-hidden group cursor-pointer ${
                i === 0 ? "border-nb-champagne" : "border-nb-line/60"
              }`}
              onClick={() => setAsPortada(i)}
              title="Tocar para usar como foto de portada"
            >
              <Image src={img} alt="" fill className="object-cover" />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage(i);
                }}
                className="absolute top-1 right-1 bg-nb-black/80 text-nb-cream p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Quitar foto"
              >
                <Trash2 size={12} />
              </button>
              {i === 0 && (
                <span className="absolute bottom-0 inset-x-0 bg-nb-champagne text-nb-black text-[10px] text-center py-0.5 font-medium">
                  Portada
                </span>
              )}
            </div>
          ))}
        </div>

        <label className="block w-full border-2 border-dashed border-nb-champagne/50 rounded p-6 text-center cursor-pointer hover:border-nb-champagne hover:bg-nb-champagne/5 transition-colors">
          <span className="flex flex-col items-center gap-2 text-nb-champagne pointer-events-none">
            {uploading ? (
              <>
                <Loader2 size={22} className="animate-spin" />
                Subiendo fotos…
              </>
            ) : (
              <>
                <Upload size={22} />
                Tocá acá para elegir fotos desde tu celular o compu
              </>
            )}
          </span>
          <input
            type="file"
            accept="image/*"
            multiple
            disabled={uploading}
            onChange={(e) => {
              const files = e.target.files ? Array.from(e.target.files) : [];
              e.target.value = "";
              handleFilesSelected(files);
            }}
            style={{
              position: "absolute",
              width: "1px",
              height: "1px",
              padding: 0,
              margin: "-1px",
              overflow: "hidden",
              clip: "rect(0,0,0,0)",
              whiteSpace: "nowrap",
              border: 0,
            }}
          />
        </label>
        {form.imagenes.length > 0 && (
          <p className="text-sm text-nb-beige/60 mt-2">
            Tocá cualquier foto de arriba para marcarla como portada.
          </p>
        )}
      </section>

      {/* PASO 2: LO BÁSICO */}
      <section>
        <div className="flex items-center gap-2 mb-5">
          <span className="w-6 h-6 rounded-full bg-nb-champagne text-nb-black text-xs font-bold flex items-center justify-center flex-shrink-0">2</span>
          <h2 className="text-sm tracking-widest3 uppercase text-nb-champagne">¿Qué estás publicando?</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          <Field label="Nombre del producto" span2>
            <input className="input" value={form.nombre} onChange={(e) => set("nombre", e.target.value)} placeholder="Ej: Banqueta Nubari Tapizada" />
          </Field>
          <Field label="Descripción" span2>
            <textarea className="input" rows={3} value={form.descripcion} onChange={(e) => set("descripcion", e.target.value)} placeholder="Contale al cliente de qué está hecho, para qué sirve..." />
          </Field>
          <Field label="Categoría">
            <select className="input" value={form.categoria} onChange={(e) => set("categoria", e.target.value as ProductCategory)}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Precio de venta">
            <input className="input" type="number" value={form.precio} onChange={(e) => set("precio", e.target.value)} placeholder="$" />
          </Field>
        </div>
        <div className="flex flex-wrap gap-6 mt-5">
          <Checkbox label="Destacado" checked={form.destacado} onChange={(v) => set("destacado", v)} />
          <Checkbox label="Nuevo" checked={form.nuevo} onChange={(v) => set("nuevo", v)} />
          <Checkbox label="Agotado / sin stock" checked={form.agotado} onChange={(v) => set("agotado", v)} />
          <Checkbox label="Activo (visible en la tienda)" checked={form.activo} onChange={(v) => set("activo", v)} />
        </div>
        <div className="mt-5">
          <Field label="Link de pago con tarjeta — Mercado Pago (opcional)">
            <input
              className="input"
              value={form.mercadoPagoLink}
              onChange={(e) => set("mercadoPagoLink", e.target.value)}
              placeholder="https://mpago.la/..."
            />
          </Field>
        </div>
      </section>

      {/* PASO 3: MEDIDAS */}
      <section>
        <div className="flex items-center gap-2 mb-2">
          <span className="w-6 h-6 rounded-full bg-nb-champagne text-nb-black text-xs font-bold flex items-center justify-center flex-shrink-0">3</span>
          <h2 className="text-sm tracking-widest3 uppercase text-nb-champagne">Medidas</h2>
        </div>
        <p className="text-sm text-nb-beige/70 mb-4">
          En centímetros. El cliente las va a ver en la ficha del producto, y también se usan para calcular el envío.
        </p>
        <div className="grid grid-cols-2 gap-5 mb-5">
          <Field label="Alto (cm)">
            <input className="input" type="number" value={form.altoCm} onChange={(e) => set("altoCm", e.target.value)} />
          </Field>
          <Field label="Ancho (cm)">
            <input className="input" type="number" value={form.anchoCm} onChange={(e) => set("anchoCm", e.target.value)} />
          </Field>
        </div>

        <div className="mb-3">
          <Checkbox
            label="Este producto viene en varios largos"
            checked={form.multiplesLargos}
            onChange={(v) => set("multiplesLargos", v)}
          />
        </div>

        {!form.multiplesLargos ? (
          <Field label="Largo (cm)">
            <input className="input max-w-[200px]" type="number" value={form.largoCm} onChange={(e) => set("largoCm", e.target.value)} />
          </Field>
        ) : (
          <div className="border border-nb-line/60 bg-nb-card p-4">
            <p className="text-sm text-nb-beige/70 mb-3">
              Tildá los largos que ofrecés. Si alguno sale más caro, poné la diferencia de precio.
            </p>
            <div className="space-y-3">
              {LARGOS_DISPONIBLES.map((cm) => {
                const activo = form.largos.find((l) => l.cm === cm);
                return (
                  <div key={cm} className="flex items-center gap-4">
                    <label className="flex items-center gap-2.5 text-sm text-nb-cream w-24">
                      <input
                        type="checkbox"
                        checked={!!activo}
                        onChange={() => toggleLargo(cm)}
                        className="w-4 h-4 accent-[#B25B3B]"
                      />
                      {cm === 100 ? "1 mt" : cm === 120 ? "1,20 mts" : `${cm} cm`}
                    </label>
                    {activo && (
                      <input
                        className="input max-w-[180px]"
                        type="number"
                        value={activo.priceDelta}
                        onChange={(e) => updateLargoPrecio(cm, e.target.value)}
                        placeholder="Precio extra (opcional)"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* PASO 4: COLOR DE ESTRUCTURA */}
      <section>
        <div className="flex items-center gap-2 mb-2">
          <span className="w-6 h-6 rounded-full bg-nb-champagne text-nb-black text-xs font-bold flex items-center justify-center flex-shrink-0">4</span>
          <h2 className="text-sm tracking-widest3 uppercase text-nb-champagne">Color de la estructura</h2>
        </div>
        <p className="text-sm text-nb-beige/70 mb-5">
          Elegí qué colores de estructura ofrecés para este producto (terminación siempre {TERMINACION.toLowerCase()}).
          Si alguno sale más caro, poné la diferencia en "Precio extra".
        </p>
        <div className="space-y-3">
          {form.variantes.map((v) => (
            <div key={v.id} className="border border-nb-line/60 bg-nb-card p-4">
              <div className="grid sm:grid-cols-3 gap-3 items-end">
                <Field label="Color de estructura">
                  <select className="input" value={v.color} onChange={(e) => updateVariant(v.id, { color: e.target.value })}>
                    {COLORES_ESTRUCTURA.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Terminación">
                  <input className="input opacity-60" value={TERMINACION} disabled />
                </Field>
                <Field label="Precio extra (opcional)">
                  <input className="input" type="number" value={v.priceDelta} onChange={(e) => updateVariant(v.id, { priceDelta: e.target.value })} placeholder="0" />
                </Field>
              </div>
              {form.variantes.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeVariant(v.id)}
                  className="mt-3 text-sm text-nb-beige/70 hover:text-red-500 transition-colors flex items-center gap-1"
                >
                  <Trash2 size={13} /> Quitar este color
                </button>
              )}
            </div>
          ))}
        </div>
        {form.variantes.length < COLORES_ESTRUCTURA.length && (
          <button
            type="button"
            onClick={addVariant}
            className="mt-4 text-sm text-nb-champagne hover:text-nb-gold transition-colors flex items-center gap-1"
          >
            <Plus size={14} /> Agregar otro color de estructura
          </button>
        )}
      </section>

      {/* PASO 5: TELAS */}
      <section>
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-nb-champagne text-nb-black text-xs font-bold flex items-center justify-center flex-shrink-0">5</span>
            <h2 className="text-sm tracking-widest3 uppercase text-nb-champagne">Tapizado (opcional)</h2>
          </div>
          <button
            type="button"
            onClick={() => setShowTelas((v) => !v)}
            className="text-xs tracking-widest3 uppercase border border-nb-champagne text-nb-champagne px-3 py-1.5 hover:bg-nb-champagne hover:text-nb-black transition-colors"
          >
            Elegir telas
          </button>
        </div>
        {!showTelas && (
          <p className="text-sm text-nb-beige/60 ml-8">
            Si este producto se tapiza, tocá "Elegir telas" para armar las opciones de pana o símil cuero
            que va a poder elegir el cliente.
          </p>
        )}
        {showTelas && (
          <div className="ml-8 space-y-6 mt-3">
            <div className="flex gap-4">
              {(Object.keys(TELA_LABELS) as TelaTipo[]).map((tipo) => (
                <label key={tipo} className="flex items-center gap-2 text-sm text-nb-cream">
                  <input
                    type="checkbox"
                    checked={form.telas.some((t) => t.tipo === tipo)}
                    onChange={() => toggleTela(tipo)}
                    className="w-4 h-4 accent-[#B25B3B]"
                  />
                  {TELA_LABELS[tipo]}
                </label>
              ))}
            </div>

            {form.telas.map((tela) => (
              <div key={tela.tipo} className="border border-nb-line/60 bg-nb-card p-4">
                <p className="text-sm uppercase tracking-widest3 text-nb-champagne mb-3">
                  {TELA_LABELS[tela.tipo]} — colores del catálogo
                </p>
                <div className="flex flex-wrap gap-4 mb-4">
                  {tela.colores.map((c) => (
                    <div key={c.id} className="flex flex-col items-center gap-1.5 w-24">
                      <label
                        className="relative w-14 h-14 rounded-full border-2 border-nb-line/70 overflow-hidden cursor-pointer flex-shrink-0"
                        style={{ backgroundColor: c.hex }}
                        title="Tocar para subir una foto real de esta tela"
                      >
                        {c.imagen && <Image src={c.imagen} alt={c.nombre} fill className="object-cover" />}
                        {uploadingSwatch === c.id && (
                          <span className="absolute inset-0 flex items-center justify-center bg-nb-black/50">
                            <Loader2 size={16} className="animate-spin text-nb-cream" />
                          </span>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            e.target.value = "";
                            if (file) handleSwatchPhoto(tela.tipo, c.id, file);
                          }}
                        />
                      </label>
                      <input
                        className="input !p-1.5 !text-xs text-center"
                        value={c.nombre}
                        onChange={(ev) => updateColorTela(tela.tipo, c.id, { nombre: ev.target.value })}
                        placeholder="Nombre"
                      />
                      <input
                        type="color"
                        value={c.hex}
                        onChange={(ev) => updateColorTela(tela.tipo, c.id, { hex: ev.target.value })}
                        className="w-8 h-6 border border-nb-line/60 cursor-pointer bg-transparent"
                        title="Color de referencia (si no subís foto real)"
                      />
                      <button
                        type="button"
                        onClick={() => removeColorTela(tela.tipo, c.id)}
                        className="text-nb-beige/60 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => addColorTela(tela.tipo)}
                  className="text-sm text-nb-champagne hover:text-nb-gold transition-colors flex items-center gap-1"
                >
                  <Plus size={14} /> Agregar color de {TELA_LABELS[tela.tipo].toLowerCase()}
                </button>
                <p className="text-xs text-nb-beige/50 mt-2">
                  Tocá el círculo para subir la foto real del color del catálogo (cuando la tengas). Mientras
                  tanto, el color de al lado se usa como referencia.
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* PASO 6: ENVÍO — escondido por defecto */}
      <section>
        <button
          type="button"
          onClick={() => setShowLogistica((v) => !v)}
          className="flex items-center gap-2 w-full text-left"
        >
          <span className="w-6 h-6 rounded-full bg-nb-champagne text-nb-black text-xs font-bold flex items-center justify-center flex-shrink-0">6</span>
          <h2 className="text-sm tracking-widest3 uppercase text-nb-champagne flex-1">
            Datos para calcular el envío
          </h2>
          <ChevronDown
            size={18}
            className={`text-nb-champagne transition-transform ${showLogistica ? "rotate-180" : ""}`}
          />
        </button>
        {!showLogistica && (
          <p className="text-sm text-nb-beige/60 mt-2 ml-8">
            Peso y cantidad de bultos — tocá para completarlo (recomendado para que el cotizador de envío
            funcione bien).
          </p>
        )}
        {showLogistica && (
          <div className="mt-5 ml-8">
            <div className="grid sm:grid-cols-3 gap-5">
              <Field label="Peso (kg)">
                <input className="input" type="number" step="0.1" value={form.pesoKg} onChange={(e) => set("pesoKg", e.target.value)} />
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
          </div>
        )}
      </section>

      {error && (
        <p className="text-sm text-red-600 bg-red-500/10 border border-red-500/30 px-4 py-3">{error}</p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="px-7 py-3.5 bg-nb-champagne text-nb-black text-sm font-medium hover:bg-nb-gold transition-colors disabled:opacity-50"
      >
        {saving ? "Guardando…" : initial ? "Guardar cambios" : "Publicar producto"}
      </button>

      <style jsx global>{`
        .input {
          width: 100%;
          padding: 0.7rem 0.85rem;
          border: 1px solid #E6D9C2;
          background: #FFFFFF;
          color: #3B3128;
          font-size: 0.95rem;
        }
        .input::placeholder {
          color: rgba(91, 78, 63, 0.45);
        }
        .input:focus {
          outline: none;
          border-color: #B25B3B;
        }
      `}</style>
    </form>
  );
}

function Field({ label, children, span2 }: { label: string; children: React.ReactNode; span2?: boolean }) {
  return (
    <div className={span2 ? "sm:col-span-2" : ""}>
      <label className="block text-sm text-nb-beige/85 mb-2">{label}</label>
      {children}
    </div>
  );
}

function Checkbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2.5 text-sm text-nb-cream">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="w-4 h-4 accent-[#B25B3B]" />
      {label}
    </label>
  );
}
