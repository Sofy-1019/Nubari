import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/lib/cartContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloatingButton from "@/components/WhatsAppFloatingButton";

// Las tipografías se cargan como <link> en el <head> (ver abajo) en lugar de
// next/font, porque next/font/google necesita descargar los archivos de
// fuente DURANTE EL BUILD y eso falla en entornos sin salida a internet
// (por ejemplo, este sandbox). En tu máquina/servidor con internet esto
// funciona igual de bien; si preferís next/font, podés volver a usarlo ahí.

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "Nubari | Muebles y decoración",
    template: "%s | Nubari",
  },
  description:
    "Muebles, banquetas y soluciones de organización con diseño, estilo y funcionalidad.",
  openGraph: {
    title: "Nubari | Muebles y decoración",
    description:
      "Muebles, banquetas y soluciones de organización con diseño, estilo y funcionalidad.",
    siteName: "Nubari",
    locale: "es_AR",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&family=Manrope:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">
        <CartProvider>
          <Header />
          <main>{children}</main>
          <Footer />
          <WhatsAppFloatingButton />
        </CartProvider>
      </body>
    </html>
  );
}
