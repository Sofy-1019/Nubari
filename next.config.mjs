/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
  // Evita que el navegador/Next.js guarde en caché las páginas del panel
  // de administración al navegar con los links del menú, para que siempre
  // se vea el dato más actualizado (productos recién creados, etc).
  experimental: {
    staleTimes: {
      dynamic: 0,
      static: 0,
    },
  },
};

export default nextConfig;
