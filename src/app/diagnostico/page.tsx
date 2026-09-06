
export default function DiagnosticoPage() {
  const tieneBlob = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
  const tienePassword = Boolean(process.env.ADMIN_PASSWORD);

  return (
    <div style={{ padding: 40, fontFamily: "monospace", fontSize: 18, lineHeight: 2 }}>
      <h1>Diagnóstico Nubari</h1>
      <p>
        Almacenamiento de fotos (Blob): {tieneBlob ? "✅ CONECTADO" : "❌ NO CONECTADO"}
      </p>
      <p>
        Contraseña de admin configurada: {tienePassword ? "✅ SÍ" : "❌ NO"}
      </p>
    </div>
  );
}
