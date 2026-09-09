const { User } = require('../../../src/domain/entities/User');

let idCounter = 0;

class InMemoryUserRepository {
  constructor() {
    this.usersByAuthId = new Map();
    this.usersById = new Map();
  }

  async findByAuthUserId(authUserId) {
    return this.usersByAuthId.get(authUserId) || null;
  }

  async findById(id) {
    return this.usersById.get(id) || null;
  }

  async create(user) {
    idCounter += 1;
    const persisted = new User(
      `user-${idCounter}`,
      user.authUserId,
      user.email,
      user.fullName,
      user.role,
      user.status,
      user.createdAt,
      user.updatedAt
    );
    this.usersByAuthId.set(persisted.authUserId, persisted);
    this.usersById.set(persisted.id, persisted);
    return persisted;
  }

  async update(user) {
    if (!this.usersByAuthId.has(user.authUserId)) {
      throw new Error('Usuario no encontrado para actualizar');
    }
    this.usersByAuthId.set(user.authUserId, user);
    this.usersById.set(user.id, user);
    return user;
  }

  async delete(authUserId) {
    const user = this.usersByAuthId.get(authUserId);
    if (user) this.usersById.delete(user.id);
    this.usersByAuthId.delete(authUserId);
  }

  async list() {
    return Array.from(this.usersByAuthId.values());
  }
}

module.exports = { InMemoryUserRepository };
