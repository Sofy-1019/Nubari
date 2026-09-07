"use client";

import { useEffect, useState } from "react";

interface Diagnostico {
  tieneBlob: boolean;
  tienePassword: boolean;
  blobPrueba: { ok: boolean; detalle: string };
  productosPrueba: { ok: boolean; detalle: string };
}

export default function DiagnosticoPage() {
  const [data, setData] = useState<Diagnostico | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/diagnostico")
      .then((res) => res.json())
      .then(setData)
      .catch((err) => setError(String(err)));
  }, []);

  return (
    <div style={{ padding: 40, fontFamily: "monospace", fontSize: 16, lineHeight: 2, maxWidth: 700 }}>
      <h1>Diagnóstico Nubari</h1>
      {error && <p>Error consultando el diagnóstico: {error}</p>}
      {!data && !error && <p>Probando conexión con el almacenamiento de datos…</p>}
      {data && (
        <>
          <p>Variable BLOB_READ_WRITE_TOKEN configurada: {data.tieneBlob ? "✅ SÍ" : "❌ NO"}</p>
          <p>Contraseña de admin configurada: {data.tienePassword ? "✅ SÍ" : "❌ NO"}</p>
          <p>
            Prueba real de guardado en Blob: {data.blobPrueba.ok ? "✅ FUNCIONA" : "❌ FALLÓ"}
            <br />
            Detalle: {data.blobPrueba.detalle}
          </p>
          <p>
            Lectura de productos: {data.productosPrueba.ok ? "✅ FUNCIONA" : "❌ FALLÓ"}
            <br />
            Detalle: {data.productosPrueba.detalle}
          </p>
        </>
      )}
    </div>
  );
}
