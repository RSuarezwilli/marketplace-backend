# Marketplace de Compra y Venta de Productos — Backend

Backend en **Node.js + JavaScript** (sin TypeScript) + Express, con Supabase
como base de datos y proveedor de autenticación. Arquitectura por capas
(dominio / aplicación / infraestructura / interfaces HTTP) con inyección de
dependencias manual (composition root en `src/app.js`).

Consulta **`Backlog.md`** para las historias de usuario y **`progress.md`**
para el estado de implementación, pruebas y validación de cada una.

## Requisitos

- Node.js 20+ (usa `node --watch`, disponible desde Node 18.11+)
- Una instancia de Supabase (proyecto en supabase.com o local con `supabase start`)

## Instalación

```bash
npm install
cp .env.example .env
# completar SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY y SUPABASE_WEBHOOK_SECRET
```

## Base de datos

Aplica las migraciones SQL en `supabase/migrations/` (en orden) contra tu
proyecto de Supabase, vía el SQL Editor del dashboard o la CLI de Supabase:

```bash
supabase db push
```

## Configurar la sincronización con Supabase Auth

En el dashboard de Supabase: **Authentication → Hooks (Auth Hooks)**, configura
un webhook hacia `POST https://tu-dominio/webhooks/supabase/auth` para los
eventos `user.created`, `user.updated` y `user.deleted`, usando el mismo
secreto que definiste en `SUPABASE_WEBHOOK_SECRET`.

## Desarrollo

```bash
npm run dev     # servidor con recarga en caliente (node --watch)
npm test        # pruebas unitarias con cobertura (Jest)
npm start       # ejecuta el servidor normal
```

No hay paso de compilación (`build`): es JavaScript plano, se ejecuta directo.

## Estructura

```
src/
  domain/               entidades (User, Product) y contratos de repositorio (documentados con JSDoc)
  application/          servicios (casos de uso) y validadores (Zod)
  infrastructure/       adaptadores concretos sobre Supabase
  interfaces/http/      controllers, rutas y middlewares de Express
  app.js                composition root (inyección de dependencias)
  server.js             punto de entrada
tests/unit/             pruebas unitarias (con dobles de prueba en memoria)
supabase/migrations/    esquema SQL + Row Level Security
```

## Nota sobre el lenguaje

Este proyecto usa **CommonJS** (`require` / `module.exports`), el estilo de
módulos más tradicional de Node.js, en lugar de `import`/`export` (ES Modules)
o TypeScript. Es la forma más simple de escribir JavaScript en Node sin
configuración adicional.

## Endpoints principales

> Autenticación (registro/login) gestionada directamente por **Supabase Auth**;
> este backend sincroniza los usuarios vía webhook (ver sección de Webhooks).

### Salud del servicio

| Método | Ruta | Auth requerida | Descripción |
|--------|------|:---:|-------------|
| GET | /health | No | Verifica que el servicio esté activo |

### Productos

| Método | Ruta | Auth requerida | Descripción |
|--------|------|:---:|-------------|
| GET | /products | No | Lista los productos disponibles |
| GET | /products/mine | Sí | Lista los productos publicados por el usuario autenticado |
| POST | /products | Sí | Crea un nuevo producto |
| PATCH | /products/:id | Sí | Actualiza un producto |
| PATCH | /products/:id/reserve | Sí | Marca un producto como reservado |
| PATCH | /products/:id/sell | Sí | Marca un producto como vendido |
| DELETE | /products/:id | Sí | Elimina un producto |

### Usuarios

| Método | Ruta | Auth requerida | Descripción |
|--------|------|:---:|-------------|
| GET | /users/me | Sí | Obtiene el perfil del usuario autenticado |

### Vendedores / Reseñas

| Método | Ruta | Auth requerida | Descripción |
|--------|------|:---:|-------------|
| POST | /sellers/:sellerId/reviews | Sí | Crea una reseña para un vendedor |
| GET | /sellers/:sellerId/reviews | No | Lista las reseñas de un vendedor |
| GET | /sellers/:sellerId/rating | No | Obtiene la calificación promedio de un vendedor |

### Webhooks (integración con Supabase Auth)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | /webhooks/supabase/auth | Recibe eventos de creación/actualización/eliminación de usuarios desde Supabase, con verificación de firma (Svix) |

## Seguridad y buenas prácticas

- **Helmet** para cabeceras HTTP seguras
- **CORS** habilitado
- **Rate limiting** configurable por variables de entorno
- Verificación de firma en webhooks (evita solicitudes falsificadas)
