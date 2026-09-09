const { User } = require('../../../src/domain/entities/User');

describe('User (entidad de dominio)', () => {
  it('construye un usuario válido desde el payload de Supabase Auth', () => {
    const user = User.fromSupabaseAuthPayload({
      id: 'auth-123',
      email: 'carlos@example.com',
      user_metadata: { full_name: 'Carlos Ruiz' },
      created_at: '2026-02-01T10:00:00.000Z'
    });

    expect(user.authUserId).toBe('auth-123');
    expect(user.email).toBe('carlos@example.com');
    expect(user.fullName).toBe('Carlos Ruiz');
    expect(user.role).toBe('buyer');
    expect(user.status).toBe('active');
  });

  it('usa fullName null si no viene en el metadata', () => {
    const user = User.fromSupabaseAuthPayload({
      id: 'auth-456',
      email: 'sin-nombre@example.com',
      created_at: '2026-02-01T10:00:00.000Z'
    });

    expect(user.fullName).toBeNull();
  });

  it('deactivate() cambia el estado a inactive', () => {
    const user = User.fromSupabaseAuthPayload({
      id: 'auth-789',
      email: 'x@example.com',
      created_at: '2026-02-01T10:00:00.000Z'
    });

    user.deactivate();
    expect(user.status).toBe('inactive');
  });

  it('ban() cambia el estado a banned', () => {
    const user = User.fromSupabaseAuthPayload({
      id: 'auth-000',
      email: 'y@example.com',
      created_at: '2026-02-01T10:00:00.000Z'
    });

    user.ban();
    expect(user.status).toBe('banned');
  });

  it('updateProfile() actualiza solo los campos provistos', () => {
    const user = User.fromSupabaseAuthPayload({
      id: 'auth-111',
      email: 'z@example.com',
      user_metadata: { full_name: 'Nombre Original' },
      created_at: '2026-02-01T10:00:00.000Z'
    });

    user.updateProfile({ email: 'nuevo@example.com' });

    expect(user.email).toBe('nuevo@example.com');
    expect(user.fullName).toBe('Nombre Original');
  });
});
