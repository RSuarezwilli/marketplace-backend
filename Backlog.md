# Backlog — Marketplace de Compra y Venta de Productos

> Este backlog es la fuente de verdad de las Historias de Usuario (HU) del proyecto.
> Cada HU tiene un ID estable, que se referencia desde `progress.md` para mantener
> ambos documentos sincronizados. Al cerrar o modificar una HU aquí, actualizar
> también su fila correspondiente en `progress.md` en el mismo cambio.

**Leyenda de estado:** 🟢 Implementada y probada · 🟡 Parcial (dominio listo, falta exponer/otra capa) · ⚪ Pendiente (no iniciada)

---

## Épica 1 — Autenticación y sincronización de Usuarios con Supabase Auth

Objetivo: mantener `public.users` como espejo consistente de `auth.users`, reaccionando
a los eventos del ciclo de vida del usuario que emite Supabase Auth (Auth Hooks / webhook).

### HU-01 — Alta de usuario sincronizada desde Supabase Auth
**Como** sistema del marketplace,
**quiero** crear automáticamente un perfil local (`public.users`) cuando Supabase Auth
registra un nuevo usuario (`user.created`),
**para** que cada usuario autenticado tenga de inmediato un perfil de negocio (rol, estado, etc.).

**Criterios de aceptación:**
- Dado un evento `user.created` válido y con firma verificada, se crea un registro en `public.users` con `auth_user_id`, `email`, `full_name` (si viene en `user_metadata`), `role='buyer'` y `status='active'` por defecto.
- Si ya existe un usuario con ese `auth_user_id` (reintento de webhook), la operación es idempotente: actualiza en vez de duplicar.
- Un payload con firma inválida o sin las cabeceras `svix-*` se rechaza con `401` y no se procesa.

**Estado:** 🟢 Implementada y probada.

---

### HU-02 — Actualización de perfil sincronizada desde Supabase Auth
**Como** sistema del marketplace,
**quiero** reflejar en `public.users` los cambios de email/metadata que ocurren en `auth.users`
(evento `user.updated`),
**para** que el perfil de negocio nunca quede desactualizado respecto a la identidad de Auth.

**Criterios de aceptación:**
- Dado un evento `user.updated`, se actualizan `email` y `full_name` del usuario local correspondiente.
- Si el usuario local no existe (se perdió el evento de creación), se crea por reconciliación defensiva en lugar de fallar.

**Estado:** 🟢 Implementada y probada.

---

### HU-03 — Baja sincronizada (soft delete) desde Supabase Auth
**Como** sistema del marketplace,
**quiero** desactivar (no borrar físicamente) el perfil local cuando Supabase Auth elimina
un usuario (evento `user.deleted`),
**para** preservar la trazabilidad de productos y transacciones asociadas a ese usuario.

**Criterios de aceptación:**
- Dado un evento `user.deleted` para un usuario existente, su `status` pasa a `inactive`; el registro no se borra de la tabla.
- Si no existe un usuario local con ese `auth_user_id`, se lanza un error explícito (no se crea uno nuevo solo para borrarlo).

**Estado:** 🟢 Implementada y probada.

---

### HU-04 — Verificación de firma del webhook de Supabase Auth
**Como** responsable de seguridad del sistema,
**quiero** que todo evento entrante al endpoint `/webhooks/supabase/auth` esté firmado y verificado
(estándar Svix usado por Supabase Auth Hooks),
**para** evitar que un tercero falsifique eventos de alta/baja de usuarios.

**Criterios de aceptación:**
- Las cabeceras `svix-id`, `svix-timestamp`, `svix-signature` son obligatorias.
- La firma se valida contra `SUPABASE_WEBHOOK_SECRET` antes de tocar cualquier lógica de negocio.
- Una firma inválida responde `401` sin exponer detalles internos.

**Estado:** 🟢 Implementada (prueba unitaria pendiente de mock de red — ver Progress; validado por revisión de código).

---

### HU-05 — Consultar el perfil del usuario autenticado
**Como** usuario autenticado,
**quiero** consultar mi propio perfil de negocio (`role`, `status`, `full_name`),
**para** ver mi información dentro del marketplace.

**Criterios de aceptación:**
- `GET /users/me` retorna `id`, `email`, `fullName`, `role`, `status` y `createdAt` del usuario autenticado.
- Si no existe un perfil local para ese usuario, responde `404`.
- Un usuario nunca puede recibir el perfil de otro: la búsqueda se hace siempre por el id del propio usuario autenticado, nunca por un id arbitrario enviado en la URL o el body.

**Estado:** 🟢 Implementada y probada. **Pendiente de deuda técnica:** hoy el id del usuario se toma del header `x-user-id` como marcador de posición; debe reemplazarse por verificación real del JWT de Supabase antes de producción (ver "Riesgos" en `progress.md`).

---

### HU-06 — Gestión de roles (buyer / seller / admin)
**Como** administrador,
**quiero** poder promover a un usuario a `seller` o `admin`,
**para** habilitar permisos diferenciados dentro del marketplace.

**Estado:** ⚪ Pendiente — el dominio soporta `UserRole`, falta caso de uso y endpoint protegido para administración.

---

## Épica 2 — Gestión de productos

### HU-07 — Publicar un producto
**Como** vendedor,
**quiero** publicar un producto con título, descripción, precio y stock,
**para** ofrecerlo a la venta en el marketplace.

**Criterios de aceptación:**
- El vendedor debe existir y estar `active`; de lo contrario se rechaza con `403`.
- `price > 0`, `stock >= 0`, `title` entre 3 y 120 caracteres, `description` entre 10 y 2000 caracteres (validado con Zod).
- El producto se crea con `status='available'`.

**Estado:** 🟢 Implementada y probada.

---

### HU-08 — Editar un producto propio
**Como** vendedor,
**quiero** editar el título, descripción, precio o stock de mis productos,
**para** mantener la información actualizada.

**Criterios de aceptación:**
- Solo el vendedor dueño (`sellerId`) puede editar; otro usuario recibe `403`.
- Editar un producto inexistente responde `404`.

**Estado:** 🟢 Implementada y probada.

---

### HU-09 — Eliminar (dar de baja) un producto propio
**Como** vendedor,
**quiero** retirar un producto de la venta,
**para** que deje de mostrarse a los compradores.

**Criterios de aceptación:**
- Solo el dueño puede eliminarlo; se marca `status='removed'` (soft delete), no se borra físicamente.

**Estado:** 🟢 Implementada y probada.

---

### HU-10 — Listar productos disponibles
**Como** comprador,
**quiero** ver la lista de productos con `status='available'`,
**para** explorar qué puedo comprar.

**Estado:** 🟢 Implementada y probada.

---

### HU-11 — Listar mis productos publicados (vendedor)
**Como** vendedor,
**quiero** ver todos mis productos, sin importar su estado,
**para** administrar mi inventario.

**Estado:** 🟡 Parcial — `ProductService.listBySeller` y el repositorio están implementados y probados a nivel de servicio; falta exponer la ruta HTTP (`GET /products/mine`).

---

## Épica 3 — Búsqueda y filtrado *(no iniciada)*

### HU-12 — Buscar productos por palabra clave
**Como** comprador, quiero buscar productos por texto en título/descripción, para encontrar lo que necesito rápidamente.
**Estado:** ⚪ Pendiente.

### HU-13 — Filtrar productos por rango de precio y categoría
**Como** comprador, quiero filtrar resultados por precio mínimo/máximo, para acotar mi búsqueda.
**Estado:** ⚪ Pendiente.

---

## Épica 4 — Transacciones de compra *(no iniciada como caso de uso completo)*

### HU-14 — Reservar un producto
**Como** comprador, quiero reservar un producto disponible, para asegurarlo mientras completo la compra.
**Estado:** 🟡 Parcial — `Product.reserve()` existe y está probado a nivel de entidad; falta el caso de uso/orquestación (`ReservationService`) y endpoint.

### HU-15 — Marcar un producto como vendido
**Como** vendedor, quiero marcar un producto como vendido tras cerrar la transacción, para reflejar el estado real del inventario.
**Estado:** 🟡 Parcial — `Product.markSold()` existe y está probado a nivel de entidad; falta caso de uso/endpoint.

### HU-16 — Procesar el pago de una compra
**Como** comprador, quiero pagar por un producto reservado, para completar la transacción.
**Estado:** ⚪ Pendiente (requiere integración con pasarela de pago; fuera del alcance de esta iteración).

---

## Épica 5 — Reputación y reseñas *(no iniciada)*

### HU-17 — Dejar una reseña a un vendedor
**Como** comprador, quiero calificar y comentar sobre un vendedor tras una compra, para ayudar a otros compradores.
**Estado:** ⚪ Pendiente.

### HU-18 — Ver calificación promedio de un vendedor
**Como** comprador, quiero ver el promedio de calificaciones de un vendedor, para decidir si comprarle.
**Estado:** ⚪ Pendiente.

---

## Notas de alcance de esta iteración

Esta iteración se enfocó, según lo solicitado explícitamente, en la **sincronización de Users
con Supabase Auth** (Épica 1) y en las operaciones núcleo de **productos** (Épica 2) necesarias
para que el marketplace tenga un flujo mínimo viable de publicación y consulta. Las épicas 3, 4
y 5 quedan documentadas con sus HU para futuras iteraciones, y algunas HU quedan en estado
🟡 *Parcial* porque su lógica de dominio ya existe (y está probada a nivel de entidad/servicio)
pero aún no se expuso como endpoint HTTP — el detalle exacto de qué falta está en `progress.md`.
