const { Product } = require('../../domain/entities/Product');

const TABLE = 'products';

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

  async listAvailable(filters = {}) {
    const { limit = 20, offset = 0, q, minPrice, maxPrice } = filters;

    let query = this.client.from(TABLE).select('*').eq('status', 'available');

    if (q) {
      query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
    }

    if (minPrice !== undefined) query = query.gte('price', minPrice);
    if (maxPrice !== undefined) query = query.lte('price', maxPrice);

    const { data, error } = await query.range(offset, offset + limit - 1).order('created_at', { ascending: false });

    if (error) throw new Error(`Error listando productos disponibles: ${error.message}`);
    return data.map(rowToEntity);
  }
}

module.exports = { SupabaseProductRepository };