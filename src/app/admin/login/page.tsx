"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Lock } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo iniciar sesión.");
        return;
      }
      const next = searchParams.get("next") || "/admin";
      router.push(next);
      router.refresh();
    } catch {
      setError("No se pudo iniciar sesión. Intentá nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-sm border border-nb-line/60 bg-nb-card p-8"
    >
      <div className="w-12 h-12 rounded-full border border-nb-champagne/50 flex items-center justify-center mx-auto mb-5">
        <Lock size={18} className="text-nb-champagne" />
      </div>
      <h1 className="font-serif text-2xl text-nb-cream text-center mb-1">Administrador</h1>
      <p className="text-sm text-nb-beige/55 text-center mb-6">
        Ingresá la contraseña para acceder al panel.
      </p>
      <label className="block text-[11px] tracking-wide text-nb-beige/55 mb-1.5">
        Contraseña
      </label>
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
          className="w-full px-3.5 py-2.5 pr-11 bg-nb-black/40 border border-nb-line/60 text-nb-cream text-sm focus-ring focus:border-nb-champagne outline-none"
        />
        <button
          type="button"
          onClick={() => setShowPassword((v) => !v)}
          aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-nb-beige/50 hover:text-nb-champagne transition-colors"
        >
          {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="mt-5 w-full py-3 bg-nb-champagne text-nb-black text-xs tracking-widest3 uppercase hover:bg-nb-gold transition-colors disabled:opacity-50 focus-ring"
      >
        {loading ? "Ingresando…" : "Ingresar"}
      </button>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center container-nb">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
