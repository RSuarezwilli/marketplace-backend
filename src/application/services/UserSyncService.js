const { User } = require('../../domain/entities/User');

/**
 * UserSyncService
 * ----------------
 * Caso de uso encargado de mantener la tabla local `public.users`
 * sincronizada con `auth.users` de Supabase Auth, a partir de los
 * eventos que llegan por el webhook (Auth Hook): user.created,
 * user.updated y user.deleted.
 *
 * Patrón: Service/Use-Case + Repository (inversión de dependencias:
 * depende del contrato IUserRepository, no de Supabase directamente),
 * lo que permite probarlo unitariamente con un repositorio en memoria/mock.
 *
 * Idempotencia: si el usuario ya existe (mismo authUserId), un evento
 * "user.created" repetido actualiza en vez de duplicar, evitando
 * inconsistencias ante reintentos de webhook (buena práctica de fiabilidad).
 */
class UserSyncService {
  /** @param {import('../../domain/repositories/IUserRepository')} userRepository */
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async handleAuthEvent(event) {
    switch (event.type) {
      case 'user.created':
        return this.syncOnCreate(event.record);
      case 'user.updated':
        return this.syncOnUpdate(event.record);
      case 'user.deleted':
        return this.syncOnDelete(event.record);
      default:
        throw new Error(`Tipo de evento de Supabase Auth no soportado: ${event.type}`);
    }
  }

  async syncOnCreate(record) {
    const existing = await this.userRepository.findByAuthUserId(record.id);
    if (existing) {
      existing.updateProfile({
        email: record.email,
        fullName: this.extractFullName(record.user_metadata)
      });
      return this.userRepository.update(existing);
    }

    const newUser = User.fromSupabaseAuthPayload(record);
    return this.userRepository.create(newUser);
  }

  async syncOnUpdate(record) {
    const existing = await this.userRepository.findByAuthUserId(record.id);

    if (!existing) {
      // Reconciliación defensiva: si por alguna razón no existía localmente
      // (p. ej. se perdió el evento de creación), se crea ahora.
      const newUser = User.fromSupabaseAuthPayload(record);
      return this.userRepository.create(newUser);
    }

    existing.updateProfile({
      email: record.email,
      fullName: this.extractFullName(record.user_metadata)
    });
    return this.userRepository.update(existing);
  }

  async syncOnDelete(record) {
    const existing = await this.userRepository.findByAuthUserId(record.id);
    if (!existing) {
      throw new Error(`No se encontró un usuario local para auth_user_id=${record.id}`);
    }
    // Regla de negocio: no se elimina físicamente (soft-delete) para preservar
    // trazabilidad de transacciones/productos asociados; se marca inactivo.
    existing.deactivate();
    return this.userRepository.update(existing);
  }

  extractFullName(metadata) {
    if (metadata && typeof metadata.full_name === 'string') {
      return metadata.full_name;
    }
    return undefined;
  }
}

module.exports = { UserSyncService };
