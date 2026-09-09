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

  async listAvailable() {
    return Array.from(this.products.values()).filter((p) => p.status === 'available');
  }
}

module.exports = { InMemoryProductRepository };
