# Nubari — Tienda online de muebles y decoración

Proyecto Next.js 14 (App Router) + TypeScript + Tailwind CSS, con catálogo,
carrito, cotizador de envío dinámico (Andreani / Vía Cargo), checkout,
panel administrador y arquitectura preparada para Mercado Pago.

> **Estado del proyecto:** funcional de punta a punta con datos de ejemplo.
> Las integraciones de Andreani, Vía Cargo y Mercado Pago están **arquitectónicamente
> completas** pero corriendo en modo *mock* hasta que cargues credenciales reales
> (ver punto 3 más abajo). Nada está hardcodeado ni inventado como definitivo:
> cada mock está claramente señalado en el código y se apaga solo en cuanto
> configurás las variables de entorno correspondientes.

---

## 1. Estructura del proyecto

```
nubari/
├── data/                        # "Base de datos" en JSON (productos, pedidos, reglas de envío)
│   ├── products.json
│   ├── orders.json
│   └── shipping-rules.json
├── public/images/                # Imágenes (placeholders SVG generados; reemplazar por fotos reales)
├── scripts/
│   ├── seed.ts                   # Carga productos de ejemplo
│   └── generatePlaceholders.ts
├── src/
│   ├── app/
│   │   ├── page.tsx               # Home
│   │   ├── productos/             # Catálogo + ficha de producto
│   │   ├── categorias/
│   │   ├── carrito/
│   │   ├── checkout/
│   │   ├── nosotros/ contacto/
│   │   ├── admin/                 # Panel administrador
│   │   └── api/                   # Rutas API (productos, pedidos, envío, mercado pago)
│   ├── components/                # Header, Footer, ProductCard, ShippingCalculator, etc.
│   └── lib/
│       ├── types.ts                # Tipos centrales del dominio
│       ├── cartContext.tsx         # Estado del carrito (persistido en localStorage)
│       ├── db/                     # Repositorios de productos y pedidos (sobre jsonStore)
│       └── shipping/
│           ├── types.ts             # Contrato ShippingProvider
│           ├── origin.ts            # Origen fijo (Berazategui)
│           ├── shippingService.ts   # Orquesta Andreani + Vía Cargo, aplica reglas y fallback
│           └── providers/
│               ├── andreani.ts
│               └── viaCargo.ts
├── .env.example
└── package.json
```

**Por qué esta arquitectura:** el "modelo de datos" vive en `data/*.json` a
través de una capa (`src/lib/db/jsonStore.ts`) con una interfaz mínima
(`readAll` / `writeAll` / `upsert` / `remove`). Esto te permite tener la
tienda funcionando ya mismo sin depender de un proveedor de base de datos, y
migrar a Postgres/Prisma más adelante **sin tocar el resto del código**:
solo reimplementás esas funciones.

La capa de envíos sigue el mismo principio: `ShippingProvider` es una
interfaz (`getQuote`, `getBranches`, `getNearestBranch`, `createShipment`,
`getTracking`) que implementan `AndreaniProvider` y `ViaCargoProvider`. Cada
uno intenta la llamada real si hay credenciales configuradas, y si no, usa
una cotización mock (siempre identificada como tal en el código y en la UI
con el texto "Precio de envío estimado").

---

## 2. Cómo ejecutarlo localmente

Requisitos: Node.js 18 o superior.

```bash
cd nubari
npm install
cp .env.example .env        # completá lo que tengas disponible; podés dejarlo casi vacío
npm run seed                # carga productos de ejemplo en data/products.json
npm run dev                 # http://localhost:3000
```

Para probar una build de producción:

```bash
npm run build
npm run start
```

El panel administrador está en `http://localhost:3000/admin` (sin login
todavía — ver nota de seguridad en el punto 10).

---

## 3. Variables de entorno (`.env`)

Copiá `.env.example` a `.env` y completá:

| Variable | Para qué es | Si la dejás vacía |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | URL pública del sitio (SEO, Open Graph, redirects de pago) | Usa `http://localhost:3000` |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Número de WhatsApp de Nubari (formato `5491122334455`) | Usa un número de ejemplo — cambialo antes de publicar |
| `ANDREANI_API_URL`, `ANDREANI_API_KEY`, `ANDREANI_CLIENTE`, `ANDREANI_CONTRATO` | Credenciales de la API oficial de Andreani | El cotizador usa datos **mock** para Andreani |
| `VIACARGO_API_URL`, `VIACARGO_API_KEY` | Credenciales/endpoint de Vía Cargo | El cotizador usa datos **mock** para Vía Cargo |
| `MP_ACCESS_TOKEN`, `MP_PUBLIC_KEY` | Credenciales de Mercado Pago | El botón de pago queda deshabilitado y el pedido se guarda como "pendiente de pago" |

**Nunca** subas el archivo `.env` a un repositorio; `.gitignore` ya lo excluye.

---

## 4. Cómo conectar Andreani

1. Solicitar acceso a la API oficial en https://developers.andreani.com
2. Completar en `.env`: `ANDREANI_API_URL`, `ANDREANI_API_KEY`, `ANDREANI_CLIENTE`, `ANDREANI_CONTRATO`.
3. Abrir `src/lib/shipping/providers/andreani.ts`. En cuanto detecta esas
   variables configuradas, el proveedor deja de usar el mock y empieza a
   llamar a la API real (`POST /v2/tarifas`).
4. Ajustar la función `mapAndreaniResponse()` al formato exacto que devuelva
   tu contrato (puede variar según el tipo de cuenta que te asignen).
5. Completar `getBranches()` con el endpoint real de sucursales cuando lo
   tengas, para que "agencia más cercana" muestre datos reales.

No hace falta tocar ningún otro archivo: el resto de la tienda ya consume
`AndreaniProvider` a través de la interfaz `ShippingProvider`.

---

## 5. Cómo conectar Vía Cargo

Vía Cargo no tiene una API pública unificada; el acceso depende del
convenio comercial que gestiones con ellos.

1. Una vez que tengas endpoint y credenciales, completar `VIACARGO_API_URL`
   y `VIACARGO_API_KEY` en `.env`.
2. Abrir `src/lib/shipping/providers/viaCargo.ts` y ajustar `mapViaCargoResponse()`
   al formato real de respuesta (el mock ya contempla las 4 modalidades:
   agencia→agencia, agencia→domicilio, domicilio→agencia, domicilio→domicilio).
3. Completar `getBranches()` cuando tengas el endpoint de agencias.

---

## 6. Cómo conectar Mercado Pago

1. Crear una app en https://www.mercadopago.com.ar/developers
2. Completar `MP_ACCESS_TOKEN` en `.env` (token **privado**, nunca en el frontend).
3. Instalar el SDK oficial: `npm install mercadopago`
4. Completar `src/app/api/checkout/mercado-pago/route.ts` — ya tiene el
   bloque de ejemplo comentado con `Preference.create(...)`. Al llamarlo
   desde el checkout, redirigís al usuario al `init_point` que devuelve.
5. Configurar las URLs de retorno (`back_urls`) apuntando a
   `/checkout/exito` y `/checkout/error` (podés crear esas páginas cuando
   actives el pago real).

Hasta que esto esté conectado, el checkout guarda el pedido como
`pendiente_pago` y no cobra nada — es información real, no simulada.

---

## 7. Cómo cargar nuevos productos

**Desde el panel admin (recomendado):**
`/admin/productos/nuevo` → completar nombre, precio, categoría, variante y,
muy importante, los **datos logísticos** (peso, medidas, bultos, valor
declarado) — esos datos son los que usa el cotizador de envío.

**Cargando fotos reales:** subí las imágenes a `public/images/products/` y
poné la ruta (ej. `/images/products/banqueta-real.jpg`) en el campo "URL de
imagen" del formulario. Los productos de ejemplo (marcados como "producto
de prueba") usan imágenes placeholder generadas automáticamente — reemplazalas
antes de publicar.

**Por API**, para cargas masivas: `POST /api/products` con el JSON del
producto (ver `src/lib/types.ts` → `Product` para el formato completo).

---

## 8. Cómo modificar precios

Panel admin → `/admin/productos` → *Editar* sobre el producto → cambiar
"Precio" (y opcionalmente "Precio anterior" para mostrar un descuento
automático en la tienda). También se puede hacer con
`PUT /api/products/[id]` pasando `{ "precio": 12345 }`.

---

## 9. Cómo modificar medidas/peso de los productos

Mismo formulario de edición, sección **"Datos logísticos"**: peso, alto,
ancho, largo, cantidad de bultos y valor declarado. Estos son los datos que
`packagesFromProduct()` (en `src/lib/shipping/types.ts`) usa para armar la
cotización real hacia Andreani/Vía Cargo — no se recalculan solos, así que
es importante mantenerlos precisos.

Si un producto es demasiado grande para los transportistas estándar, tildá
"Requiere cotización manual" — el sistema mostrará automáticamente
"Solicitar cotización" con el botón de WhatsApp en vez de un precio.

---

## 10. Cómo publicar la web

1. **Elegí un hosting con soporte para Next.js** (Vercel es el más simple;
   también funciona en cualquier VPS/Docker con `npm run build && npm run start`).
2. Configurá las variables de entorno del punto 3 en el panel del hosting
   (nunca las subas al repositorio).
3. **Importante sobre `data/*.json`:** este proyecto usa archivos JSON como
   base de datos. Esto funciona perfecto para desarrollo y para una primera
   versión en producción con tráfico bajo, pero en la mayoría de los
   hostings "serverless" (como Vercel) el sistema de archivos **no persiste**
   entre despliegues. Antes de publicar con tráfico real, te recomendamos
   migrar `src/lib/db/jsonStore.ts` a una base de datos real (Postgres +
   Prisma es la opción más directa) — la interfaz ya está aislada
   justamente para que ese cambio no impacte el resto del código.
4. **Seguridad:** el panel `/admin` todavía no tiene autenticación — es la
   siguiente tarea antes de publicar. La forma más simple es agregar
   `next-auth` o un middleware que pida usuario/contraseña sobre las rutas
   `/admin/*` y `/api/products` (métodos POST/PUT/DELETE), usando una
   variable de entorno para las credenciales.
5. Verificá `NEXT_PUBLIC_SITE_URL` apuntando al dominio real antes del
   deploy final (afecta SEO, Open Graph y sitemap).

---

## Qué es "de prueba" y qué es real

- Los **8 productos** cargados por `npm run seed` están marcados con
  `esProductoDePrueba: true` y usan imágenes placeholder generadas
  localmente (no son fotos reales). Reemplazalos por tus productos y fotos
  reales desde `/admin/productos`.
- Las cotizaciones de Andreani y Vía Cargo son **mock** hasta que cargues
  credenciales — nunca se presentan como precio garantizado (siempre dicen
  "Precio de envío estimado").
- El botón de pago con Mercado Pago está deshabilitado hasta conectar
  `MP_ACCESS_TOKEN`.
- Ningún precio de envío está hardcodeado como definitivo: todo pasa por
  `ShippingProvider.getQuote()`, que es exactamente el punto que hay que
  reemplazar por la llamada real.

## Escalabilidad prevista

La arquitectura ya deja lugar para, sin rehacer la tienda: nuevos
transportistas (agregar un archivo en `src/lib/shipping/providers/` que
implemente `ShippingProvider`), cupones/descuentos, wishlist, reviews,
tracking de pedidos (`getTracking()` ya está en la interfaz), y migración
de la base de datos JSON a Postgres/Prisma.
