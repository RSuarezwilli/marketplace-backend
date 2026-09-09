/**
 * @typedef {'available' | 'reserved' | 'sold' | 'removed'} ProductStatus
 */

/**
 * Entidad de dominio Product: artículo publicado por un vendedor (User) en el marketplace.
 */
class Product {
  /**
   * @param {string} id
   * @param {string} sellerId
   * @param {string} title
   * @param {string} description
   * @param {number} price
   * @param {number} stock
   * @param {ProductStatus} status
   * @param {Date} createdAt
   * @param {Date} updatedAt
   */
  constructor(id, sellerId, title, description, price, stock, status, createdAt, updatedAt) {
    this.id = id;
    this.sellerId = sellerId;
    this.title = title;
    this.description = description;
    this.price = price;
    this.stock = stock;
    this.status = status;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  markSold() {
    if (this.status === 'removed') {
      throw new Error('No se puede vender un producto eliminado');
    }
    this.status = 'sold';
    this.updatedAt = new Date();
  }

  reserve() {
    if (this.status !== 'available') {
      throw new Error('Solo un producto disponible puede reservarse');
    }
    this.status = 'reserved';
    this.updatedAt = new Date();
  }

  remove() {
    this.status = 'removed';
    this.updatedAt = new Date();
  }

  /**
   * @param {{ title?: string, description?: string, price?: number, stock?: number }} fields
   */
  updateDetails(fields) {
    if (fields.title !== undefined) this.title = fields.title;
    if (fields.description !== undefined) this.description = fields.description;
    if (fields.price !== undefined) {
      if (fields.price < 0) throw new Error('El precio no puede ser negativo');
      this.price = fields.price;
    }
    if (fields.stock !== undefined) {
      if (fields.stock < 0) throw new Error('El stock no puede ser negativo');
      this.stock = fields.stock;
    }
    this.updatedAt = new Date();
  }
}

module.exports = { Product };
