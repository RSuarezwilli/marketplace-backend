/**
 * @typedef {'buyer' | 'seller' | 'admin'} UserRole
 * @typedef {'active' | 'inactive' | 'banned'} UserStatus
 */

/**
 * Entidad de dominio User: representa el perfil de negocio de un usuario,
 * espejo local sincronizado desde Supabase Auth (auth.users).
 *
 * `authUserId` es la clave de sincronización con Supabase Auth (auth.users.id).
 * Nunca debe generarse localmente: siempre proviene del evento de Supabase Auth.
 */
class User {
  /**
   * @param {string} id
   * @param {string} authUserId
   * @param {string} email
   * @param {string | null} fullName
   * @param {UserRole} role
   * @param {UserStatus} status
   * @param {Date} createdAt
   * @param {Date} updatedAt
   */
  constructor(id, authUserId, email, fullName, role, status, createdAt, updatedAt) {
    this.id = id;
    this.authUserId = authUserId;
    this.email = email;
    this.fullName = fullName;
    this.role = role;
    this.status = status;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  /**
   * Crea un User a partir de los datos crudos que llegan desde el
   * webhook de Supabase Auth cuando se crea un usuario (evento user.created / signup).
   * @param {{ id: string, email: string, user_metadata?: Record<string, unknown> | null, created_at: string }} payload
   * @returns {User}
   */
  static fromSupabaseAuthPayload(payload) {
    const now = new Date();
    const fullName =
      payload.user_metadata && typeof payload.user_metadata.full_name === 'string'
        ? payload.user_metadata.full_name
        : null;

    return new User(
      /* id local, se reemplaza al persistir */ '',
      payload.id,
      payload.email,
      fullName,
      'buyer',
      'active',
      new Date(payload.created_at),
      now
    );
  }

  deactivate() {
    this.status = 'inactive';
    this.updatedAt = new Date();
  }

  ban() {
    this.status = 'banned';
    this.updatedAt = new Date();
  }

  activate() {
    this.status = 'active';
    this.updatedAt = new Date();
  }

  /**
   * @param {{ email?: string, fullName?: string | null }} fields
   */
  updateProfile(fields) {
    if (fields.email) this.email = fields.email;
    if (fields.fullName !== undefined) this.fullName = fields.fullName;
    this.updatedAt = new Date();
  }
}

module.exports = { User };
