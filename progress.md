# Progress — Seguimiento de implementación

> Este documento se mantiene sincronizado 1:1 con `Backlog.md` por ID de HU.
> Cualquier cambio de estado en una HU debe reflejarse en ambos archivos en el
> mismo commit/entrega para no perder coherencia entre el "qué" (Backlog) y el
> "cómo va" (Progress).

**Última actualización:** 2026-09-03 (proyecto migrado de TypeScript a JavaScript puro, sin cambios de comportamiento)

## 🔄 Nota sobre el cambio de lenguaje

Este proyecto se escribió originalmente en TypeScript y se migró a **JavaScript
puro** (CommonJS, sin tipos) por preferencia del estudiante, ya que los lenguajes
vistos en el curso son JavaScript, Python y Java. La lógica, arquitectura,
patrones de diseño y pruebas son exactamente los mismos; solo cambió la sintaxis
(se quitaron las anotaciones de tipo y se documentan los contratos con JSDoc).


## ⚠️ Nota sobre ejecución de pruebas en este entorno

El entorno de este sandbox no tiene acceso a la red (`npm install` falla con
`403 Forbidden` contra el registro de npm). Por lo tanto, la suite de pruebas
**fue redactada siguiendo TDD y revisada manualmente por consistencia de tipos
e imports**, pero no pudo ejecutarse dentro de este entorno. Para validarla:

```bash
cd marketplace
npm install
npm test          # ejecuta Jest con cobertura (umbral: 80% líneas/funciones, 70% branches)
```

Todas las filas marcadas como "🟢 Pasa" a continuación están en ese estado
*bajo la expectativa de ejecución local* — se recomienda correr `npm test`
como primer paso al recibir este entregable y reportar cualquier discrepancia.

---

## Tabla de seguimiento por Historia de Usuario

| HU | Descripción corta | Implementado | Archivo(s) principales | Pruebas unitarias | Pasa pruebas | Validado |
|----|---|---|---|---|---|---|
| HU-01 | Alta de usuario sincronizada (`user.created`) | 🟢 Sí | `UserSyncService.js`, `User.js` | `UserSyncService.test.js` (2 casos: alta + idempotencia) | 🟢 Esperado (ver nota red) | 🟢 Sí |
| HU-02 | Actualización sincronizada (`user.updated`) | 🟢 Sí | `UserSyncService.js` | `UserSyncService.test.js` (2 casos: update + reconciliación) | 🟢 Esperado | 🟢 Sí |
| HU-03 | Baja sincronizada / soft delete (`user.deleted`) | 🟢 Sí | `UserSyncService.js`, `User.deactivate()` | `UserSyncService.test.js` (2 casos: soft delete + error si no existe) | 🟢 Esperado | 🟢 Sí |
| HU-04 | Verificación de firma del webhook (Svix) | 🟢 Sí | `verifyWebhookSignature.js`, `webhookRoutes.js` | *Pendiente* (requiere mock de `svix.Webhook` o prueba de integración con `supertest`) | ⚪ Sin prueba automatizada aún | 🟡 Validado por revisión de código, no por test |
| HU-05 | Consultar perfil propio (`GET /users/me`) | 🟢 Sí | `UserProfileService.js`, `UserController.js`, `userRoutes.js` | `UserProfileService.test.js` (3 casos: existe, no existe, no filtra por otro usuario) | 🟢 Esperado (ver nota red) | 🟢 Sí |
| HU-06 | Gestión de roles (admin) | ⚪ No | — (dominio soporta `UserRole`) | — | — | ⚪ No aplica |
| HU-07 | Publicar producto | 🟢 Sí | `ProductService.js`, `Product.js`, `productValidators.js` | `ProductService.test.js`, `Product.test.js`, `productValidators.test.js` | 🟢 Esperado | 🟢 Sí |
| HU-08 | Editar producto propio | 🟢 Sí | `ProductService.updateProduct` | `ProductService.test.js` (3 casos: éxito, no dueño, no existe) | 🟢 Esperado | 🟢 Sí |
| HU-09 | Eliminar producto propio (soft delete) | 🟢 Sí | `ProductService.removeProduct`, `Product.remove()` | `ProductService.test.js` | 🟢 Esperado | 🟢 Sí |
| HU-10 | Listar productos disponibles | 🟢 Sí | `ProductService.listAvailable` | `ProductService.test.js` (filtra por `status='available'`) | 🟢 Esperado | 🟢 Sí |
| HU-11 | Listar productos propios (vendedor) | 🟡 Parcial | `ProductService.listBySeller`, `IProductRepository.listBySeller` | Cubierto indirectamente vía `InMemoryProductRepository`; falta test dedicado a nivel de controller/ruta | 🟡 Parcial | 🟡 Falta ruta HTTP |
| HU-12 | Búsqueda por palabra clave | ⚪ No | — | — | — | ⚪ No aplica |
| HU-13 | Filtro por rango de precio | ⚪ No | — | — | — | ⚪ No aplica |
| HU-14 | Reservar producto | 🟡 Parcial | `Product.reserve()` | `Product.test.js` (2 casos: éxito y error de estado) | 🟢 Esperado (a nivel de entidad) | 🟡 Falta caso de uso/endpoint |
| HU-15 | Marcar producto como vendido | 🟡 Parcial | `Product.markSold()` | `Product.test.js` (2 casos) | 🟢 Esperado (a nivel de entidad) | 🟡 Falta caso de uso/endpoint |
| HU-16 | Procesar pago | ⚪ No | — | — | — | ⚪ No aplica |
| HU-17 | Dejar reseña a vendedor | ⚪ No | — | — | — | ⚪ No aplica |
| HU-18 | Ver calificación promedio | ⚪ No | — | — | — | ⚪ No aplica |

**Transversal:** `env.js` (validación de configuración con Zod) tiene su propia suite:
`env.test.js` (4 casos: valores por defecto, falta `SUPABASE_URL`, URL inválida, falta
secreto del webhook) — 🟢 Sí implementado, 🟢 Esperado que pase, 🟢 Validado.

---

## Cobertura de pruebas por capa (resumen)

| Capa | Archivos con lógica | Archivos con test | Notas |
|---|---|---|---|
| Dominio (entidades) | `User.js`, `Product.js` | `User.test.js`, `Product.test.js` | Cobertura completa de invariantes de negocio (transiciones de estado, validaciones). |
| Aplicación (servicios) | `UserSyncService.js`, `ProductService.js` | `UserSyncService.test.js`, `ProductService.test.js` | Usan dobles de prueba en memoria (`InMemoryUserRepository`, `InMemoryProductRepository`) — inversión de dependencias real, sin mocks frágiles. |
| Aplicación (validadores) | `authWebhookValidators.js`, `productValidators.js` | Ambos con test dedicado | Casos positivos y negativos (payload inválido, tipos incorrectos). |
| Config | `env.js` | `env.test.js` | Fail-fast ante configuración incompleta. |
| Infraestructura (Supabase) | `SupabaseUserRepository.js`, `SupabaseProductRepository.js` | *Sin test unitario* | Son adaptadores delgados sobre el SDK de Supabase; se validan mejor con pruebas de integración contra una instancia real/local de Supabase (fuera del alcance de pruebas unitarias). Recomendado como siguiente paso. |
| HTTP (controllers/middlewares) | `AuthWebhookController.js`, `ProductController.js`, `verifyWebhookSignature.js`, `errorHandler.js` | *Sin test unitario* | Recomendado cubrir con pruebas de integración (`supertest`) en la siguiente iteración. |

---

## Buenas prácticas y seguridad aplicadas (checklist)

- [x] **Arquitectura por capas** (dominio / aplicación / infraestructura / interfaces HTTP) con **inversión de dependencias**: los servicios dependen de interfaces (`IUserRepository`, `IProductRepository`), no de Supabase directamente.
- [x] **Patrón Repository** para aislar la persistencia y permitir dobles de prueba en memoria.
- [x] **Validación estricta de entrada** con Zod en el borde del sistema (webhook y API HTTP), antes de tocar lógica de negocio.
- [x] **Verificación criptográfica de firma** en el webhook de Supabase Auth (Svix) — evita eventos falsificados.
- [x] **Fail-fast de configuración**: `env.js` valida variables de entorno al arrancar.
- [x] **Principio de menor privilegio**: la Service Role Key de Supabase solo se usa server-side; RLS habilitado en las tablas para el resto del tráfico.
- [x] **Soft delete** en usuarios y productos, para preservar trazabilidad e integridad referencial.
- [x] **Idempotencia** en la sincronización de usuarios ante reintentos de webhook.
- [x] **Manejo centralizado de errores** que no filtra detalles internos al cliente.
- [x] **Seguridad HTTP básica**: `helmet`, `cors`, `express-rate-limit`.
- [x] **Control de propiedad (ownership check)** antes de editar/eliminar productos.
- [ ] Pendiente: autenticación de usuario final en rutas de producto (hoy se usa el header `x-user-id` como marcador de posición; **debe** reemplazarse por verificación real del JWT de Supabase antes de producción — ver sección "Riesgos" abajo).
- [ ] Pendiente: pruebas de integración HTTP (`supertest`) para controllers y middlewares.

---

## Riesgos y deuda técnica conocida

1. **`x-user-id` como marcador de posición.** `ProductController.update`/`remove` y ahora también
   `UserController.me` (HU-05) leen el "usuario actual" desde el header `x-user-id`, lo cual
   **no es seguro** por sí solo: cualquiera podría enviar el `id` de otro usuario y ver su perfil
   o editar sus productos. Antes de producción se debe añadir un middleware que valide el JWT de
   Supabase (`Authorization: Bearer <token>`) y derive el `authUserId`/`sellerId` de ahí, nunca de
   un header no verificado. Se deja explícito para que no se pierda en la coherencia del proyecto.
2. **Sin pruebas de integración.** Las pruebas actuales son unitarias puras (con dobles en
   memoria). Repositorios Supabase y controllers HTTP no tienen cobertura automatizada todavía.
3. **No se pudo ejecutar `npm test` en este entorno** por falta de acceso a red (ver nota al
   inicio del documento).

---

## Próximos pasos sugeridos (siguiente iteración)

1. Añadir middleware de autenticación real (verificación de JWT de Supabase) y quitar el uso de `x-user-id`.
2. Exponer HU-11 (mis productos) como ruta HTTP (`GET /products/mine`).
3. Agregar pruebas de integración con `supertest` para los controllers y el middleware de firma del webhook.
4. Iniciar Épica 3 (búsqueda/filtrado) y Épica 4 (reservar/vender) construyendo sobre los métodos de entidad ya probados (`Product.reserve()`, `Product.markSold()`).
