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
