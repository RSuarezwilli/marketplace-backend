const { UserProfileService, UserNotFoundError } = require('../../../src/application/services/UserProfileService');
const { InMemoryUserRepository } = require('../doubles/InMemoryUserRepository');
const { User } = require('../../../src/domain/entities/User');

describe('UserProfileService (HU-05: consultar mi propio perfil)', () => {
  let repository;
  let service;

  beforeEach(() => {
    repository = new InMemoryUserRepository();
    service = new UserProfileService(repository);
  });

  it('retorna el perfil del usuario cuando existe', async () => {
    const created = await repository.create(
      User.fromSupabaseAuthPayload({
        id: 'auth-perfil-1',
        email: 'perfil@example.com',
        user_metadata: { full_name: 'Usuario De Prueba' },
        created_at: '2026-01-01T00:00:00.000Z'
      })
    );

    const profile = await service.getOwnProfile(created.authUserId);

    expect(profile.email).toBe('perfil@example.com');
    expect(profile.fullName).toBe('Usuario De Prueba');
    expect(profile.role).toBe('buyer');
  });

  it('lanza UserNotFoundError si no existe un perfil local para ese usuario autenticado', async () => {
    await expect(service.getOwnProfile('auth-inexistente')).rejects.toBeInstanceOf(UserNotFoundError);
  });

  it('nunca retorna el perfil de otro usuario: solo busca por el authUserId recibido', async () => {
    await repository.create(
      User.fromSupabaseAuthPayload({
        id: 'auth-otro-usuario',
        email: 'otro@example.com',
        created_at: '2026-01-01T00:00:00.000Z'
      })
    );

    await expect(service.getOwnProfile('auth-que-no-es-el-otro')).rejects.toBeInstanceOf(UserNotFoundError);
  });
});
