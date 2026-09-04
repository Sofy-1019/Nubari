import { NextRequest, NextResponse } from "next/server";

// ==========================================================================
// Protege todo /admin con una contraseña simple (definida en la variable de
// entorno ADMIN_PASSWORD). No hay usuarios ni base de datos: es un único
// candado compartido, pensado para un solo administrador (el dueño de la
// tienda). El login guarda una cookie con el hash de la contraseña; en cada
// visita a /admin, este middleware recalcula el hash a partir de la
// variable de entorno y lo compara.
//
// Usa la Web Crypto API (crypto.subtle) en vez del módulo "crypto" de
// Node, porque el middleware de Next.js corre en el Edge Runtime, que no
// soporta módulos nativos de Node.
// ==========================================================================

async function sha256Hex(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const pass = process.env.ADMIN_PASSWORD;

  if (!pass) {
    return NextResponse.next();
  }

  const expected = await sha256Hex(pass);
  const cookie = req.cookies.get("nubari_admin_auth")?.value;
  if (cookie === expected) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/admin/login", req.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*"],
};
