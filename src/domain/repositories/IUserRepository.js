/**
 * IUserRepository (contrato)
 * ---------------------------
 * En JavaScript no existen las interfaces de TypeScript, así que este archivo
 * documenta el contrato que debe cumplir cualquier repositorio de usuarios
 * (aquí no hay código ejecutable, solo la documentación del "puerto").
 *
 * Cualquier clase que implemente este contrato debe tener estos métodos:
 *
 *   findByAuthUserId(authUserId: string): Promise<User | null>
 *   findById(id: string): Promise<User | null>
 *   create(user: User): Promise<User>
 *   update(user: User): Promise<User>
 *   delete(authUserId: string): Promise<void>
 *   list(limit?: number, offset?: number): Promise<User[]>
 *
 * Esto permite que los servicios de aplicación (UserSyncService, etc.) reciban
 * "cualquier objeto con estos métodos" por inyección de dependencias, sin
 * depender directamente de Supabase. En las pruebas unitarias se usa
 * `InMemoryUserRepository` (tests/unit/doubles/), que cumple este mismo contrato.
 */

module.exports = {};
