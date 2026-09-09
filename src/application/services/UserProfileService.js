class UserNotFoundError extends Error {
  constructor(authUserId) {
    super(`No se encontró un perfil local para el usuario autenticado ${authUserId}`);
    this.name = 'UserNotFoundError';
  }
}

/**
 * UserProfileService: caso de uso para que un usuario autenticado consulte
 * su propio perfil de negocio (HU-05). Solo expone datos del propio usuario;
 * nunca recibe un id arbitrario del cliente sin pasar por autenticación.
 */
class UserProfileService {
  /** @param {import('../../domain/repositories/IUserRepository')} userRepository */
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async getOwnProfile(authUserId) {
    const user = await this.userRepository.findByAuthUserId(authUserId);
    if (!user) {
      throw new UserNotFoundError(authUserId);
    }
    return user;
  }
}

module.exports = { UserProfileService, UserNotFoundError };
