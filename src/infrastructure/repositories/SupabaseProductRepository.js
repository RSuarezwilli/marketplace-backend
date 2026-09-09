const { Product } = require('../../domain/entities/Product');

const TABLE = 'products';

/**
 * @param {any} row
 * @returns {Product}
 */
function rowToEntity(row) {
  return new Product(
    row.id,
    row.seller_id,
    row.title,
    row.description,
    row.price,
    row.stock,
    row.status,
    new Date(row.created_at),
    new Date(row.updated_at)
  );
}

class SupabaseProductRepository {
  /** @param {import('@supabase/supabase-js').SupabaseClient} client */
  constructor(client) {
    this.client = client;
  }

  async findById(id) {
    const { data, error } = await this.client.from(TABLE).select('*').eq('id', id).maybeSingle();
    if (error) throw new Error(`Error consultando producto: ${error.message}`);
    return data ? rowToEntity(data) : null;
  }

  async create(product) {
    const { data, error } = await this.client
      .from(TABLE)
      .insert({
        seller_id: product.sellerId,
        title: product.title,
        description: product.description,
        price: product.price,
        stock: product.stock,
        status: product.status
      })
      .select('*')
      .single();

    if (error) throw new Error(`Error creando producto: ${error.message}`);
    return rowToEntity(data);
  }

  async update(product) {
    const { data, error } = await this.client
      .from(TABLE)
      .update({
        title: product.title,
        description: product.description,
        price: product.price,
        stock: product.stock,
        status: product.status,
        updated_at: new Date().toISOString()
      })
      .eq('id', product.id)
      .select('*')
      .single();

    if (error) throw new Error(`Error actualizando producto: ${error.message}`);
    return rowToEntity(data);
  }

  async delete(id) {
    const { error } = await this.client.from(TABLE).delete().eq('id', id);
    if (error) throw new Error(`Error eliminando producto: ${error.message}`);
  }

  async listBySeller(sellerId) {
    const { data, error } = await this.client
      .from(TABLE)
      .select('*')
      .eq('seller_id', sellerId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Error listando productos del vendedor: ${error.message}`);
    return data.map(rowToEntity);
  }

  async listAvailable(limit = 20, offset = 0) {
    const { data, error } = await this.client
      .from(TABLE)
      .select('*')
      .eq('status', 'available')
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Error listando productos disponibles: ${error.message}`);
    return data.map(rowToEntity);
  }
}

module.exports = { SupabaseProductRepository };
