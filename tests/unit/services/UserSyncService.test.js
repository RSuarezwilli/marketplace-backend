const { UserSyncService } = require('../../../src/application/services/UserSyncService');
const { InMemoryUserRepository } = require('../doubles/InMemoryUserRepository');

function buildEvent(overrides = {}) {
  return {
    type: 'user.created',
    record: {
      id: '11111111-1111-1111-1111-111111111111',
      email: 'ana@example.com',
      user_metadata: { full_name: 'Ana Pérez' },
      created_at: '2026-01-01T00:00:00.000Z'
    },
    ...overrides
  };
}

describe('UserSyncService', () => {
  let repository;
  let service;

  beforeEach(() => {
    repository = new InMemoryUserRepository();
    service = new UserSyncService(repository);
  });

  describe('user.created', () => {
    it('crea un nuevo usuario local cuando no existe (HU: alta sincronizada)', async () => {
      const event = buildEvent();

      const user = await service.handleAuthEvent(event);

      expect(user.authUserId).toBe(event.record.id);
      expect(user.email).toBe('ana@example.com');
      expect(user.fullName).toBe('Ana Pérez');
      expect(user.role).toBe('buyer');
      expect(user.status).toBe('active');

      const persisted = await repository.findByAuthUserId(event.record.id);
      expect(persisted).not.toBeNull();
    });

    it('es idempotente: un evento user.created repetido actualiza en vez de duplicar', async () => {
      const event = buildEvent();
      await service.handleAuthEvent(event);

      const duplicated = buildEvent({
        record: { ...event.record, email: 'ana.nueva@example.com' }
      });
      const result = await service.handleAuthEvent(duplicated);

      const all = await repository.list();
      expect(all).toHaveLength(1);
      expect(result.email).toBe('ana.nueva@example.com');
    });
  });

  describe('user.updated', () => {
    it('actualiza el email y nombre cuando el usuario ya existe', async () => {
      const createdEvent = buildEvent();
      await service.handleAuthEvent(createdEvent);

      const updatedEvent = buildEvent({
        type: 'user.updated',
        record: {
          ...createdEvent.record,
          email: 'ana.actualizada@example.com',
          user_metadata: { full_name: 'Ana P. Actualizada' }
        }
      });

      const result = await service.handleAuthEvent(updatedEvent);

      expect(result.email).toBe('ana.actualizada@example.com');
      expect(result.fullName).toBe('Ana P. Actualizada');
    });

    it('reconcilia creando el usuario si no existía localmente (evento perdido)', async () => {
      const event = buildEvent({ type: 'user.updated' });

      const result = await service.handleAuthEvent(event);

      expect(result.authUserId).toBe(event.record.id);
      const persisted = await repository.findByAuthUserId(event.record.id);
      expect(persisted).not.toBeNull();
    });
  });

  describe('user.deleted', () => {
    it('desactiva (soft-delete) al usuario local en lugar de eliminarlo físicamente', async () => {
      const createdEvent = buildEvent();
      await service.handleAuthEvent(createdEvent);

      const deletedEvent = buildEvent({ type: 'user.deleted' });
      const result = await service.handleAuthEvent(deletedEvent);

      expect(result.status).toBe('inactive');
      const persisted = await repository.findByAuthUserId(createdEvent.record.id);
      expect(persisted).not.toBeNull();
      expect(persisted.status).toBe('inactive');
    });

    it('lanza un error si se intenta eliminar un usuario que no existe localmente', async () => {
      const deletedEvent = buildEvent({ type: 'user.deleted' });

      await expect(service.handleAuthEvent(deletedEvent)).rejects.toThrow(/No se encontró un usuario local/);
    });
  });
});
