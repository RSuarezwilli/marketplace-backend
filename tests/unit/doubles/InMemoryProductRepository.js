const { Product } = require('../../../src/domain/entities/Product');

let idCounter = 0;

class InMemoryProductRepository {
  constructor() {
    this.products = new Map();
  }

  async findById(id) {
    return this.products.get(id) || null;
  }

  async create(product) {
    idCounter += 1;
    const persisted = new Product(
      `product-${idCounter}`,
      product.sellerId,
      product.title,
      product.description,
      product.price,
      product.stock,
      product.status,
      product.createdAt,
      product.updatedAt
    );
    this.products.set(persisted.id, persisted);
    return persisted;
  }

  async update(product) {
    if (!this.products.has(product.id)) {
      throw new Error('Producto no encontrado para actualizar');
    }
    this.products.set(product.id, product);
    return product;
  }

  async delete(id) {
    this.products.delete(id);
  }

  async listBySeller(sellerId) {
    return Array.from(this.products.values()).filter((p) => p.sellerId === sellerId);
  }

  async listAvailable(filters = {}) {
    const { q, minPrice, maxPrice } = filters;

    return Array.from(this.products.values()).filter((p) => {
      if (p.status !== 'available') return false;

      if (q) {
        const needle = q.toLowerCase();
        const matches = p.title.toLowerCase().includes(needle) || p.description.toLowerCase().includes(needle);
        if (!matches) return false;
      }

      if (minPrice !== undefined && p.price < minPrice) return false;
      if (maxPrice !== undefined && p.price > maxPrice) return false;

      return true;
    });
  }
}

module.exports = { InMemoryProductRepository };