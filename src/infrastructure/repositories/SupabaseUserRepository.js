const { User } = require('../../domain/entities/User');

const TABLE = 'users';

/**
 * @param {any} row
 * @returns {User}
 */
function rowToEntity(row) {
  return new User(
    row.id,
    row.auth_user_id,
    row.email,
    row.full_name,
    row.role,
    row.status,
    new Date(row.created_at),
    new Date(row.updated_at)
  );
}

/**
 * Adaptador que implementa el contrato IUserRepository usando la tabla
 * `public.users` de Supabase (Postgres). Mantiene la tabla local
 * sincronizada con `auth.users` de Supabase Auth a partir de eventos de webhook.
 */
class SupabaseUserRepository {
  /** @param {import('@supabase/supabase-js').SupabaseClient} client */
  constructor(client) {
    this.client = client;
  }

  async findByAuthUserId(authUserId) {
    const { data, error } = await this.client.from(TABLE).select('*').eq('auth_user_id', authUserId).maybeSingle();
    if (error) throw new Error(`Error consultando usuario: ${error.message}`);
    return data ? rowToEntity(data) : null;
  }

  async findById(id) {
    const { data, error } = await this.client.from(TABLE).select('*').eq('id', id).maybeSingle();
    if (error) throw new Error(`Error consultando usuario: ${error.message}`);
    return data ? rowToEntity(data) : null;
  }

  async create(user) {
    const { data, error } = await this.client
      .from(TABLE)
      .insert({
        auth_user_id: user.authUserId,
        email: user.email,
        full_name: user.fullName,
        role: user.role,
        status: user.status
      })
      .select('*')
      .single();

    if (error) throw new Error(`Error creando usuario: ${error.message}`);
    return rowToEntity(data);
  }

  async update(user) {
    const { data, error } = await this.client
      .from(TABLE)
      .update({
        email: user.email,
        full_name: user.fullName,
        role: user.role,
        status: user.status,
        updated_at: new Date().toISOString()
      })
      .eq('auth_user_id', user.authUserId)
      .select('*')
      .single();

    if (error) throw new Error(`Error actualizando usuario: ${error.message}`);
    return rowToEntity(data);
  }

  async delete(authUserId) {
    const { error } = await this.client.from(TABLE).delete().eq('auth_user_id', authUserId);
    if (error) throw new Error(`Error eliminando usuario: ${error.message}`);
  }

  async list(limit = 50, offset = 0) {
    const { data, error } = await this.client
      .from(TABLE)
      .select('*')
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Error listando usuarios: ${error.message}`);
    return data.map(rowToEntity);
  }
}

module.exports = { SupabaseUserRepository };
