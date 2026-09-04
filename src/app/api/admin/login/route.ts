import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  const expected = process.env.ADMIN_PASSWORD;

  if (!expected) {
    return NextResponse.json(
      {
        error: "El panel todavía no tiene contraseña configurada.",
        detail: "Definí ADMIN_PASSWORD en las variables de entorno de Vercel.",
      },
      { status: 501 }
    );
  }

  if (password !== expected) {
    return NextResponse.json({ error: "Contraseña incorrecta." }, { status: 401 });
  }

  const hash = crypto.createHash("sha256").update(expected).digest("hex");
  const res = NextResponse.json({ ok: true });
  res.cookies.set("nubari_admin_auth", hash, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 días
  });
  return res;
}
