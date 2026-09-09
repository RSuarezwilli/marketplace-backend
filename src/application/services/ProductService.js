const { Product } = require('../../domain/entities/Product');

class ProductNotFoundError extends Error {
  constructor(id) {
    super(`Producto ${id} no encontrado`);
    this.name = 'ProductNotFoundError';
  }
}

class UnauthorizedProductActionError extends Error {
  constructor(message = 'No tiene permisos sobre este producto') {
    super(message);
    this.name = 'UnauthorizedProductActionError';
  }
}

/**
 * ProductService: caso de uso para publicar y administrar productos.
 * Aplica control de propiedad (solo el vendedor dueño puede editar/eliminar),
 * delegando la persistencia al repositorio inyectado.
 */
class ProductService {
  /**
   * @param {import('../../domain/repositories/IProductRepository')} productRepository
   * @param {import('../../domain/repositories/IUserRepository')} userRepository
   */
  constructor(productRepository, userRepository) {
    this.productRepository = productRepository;
    this.userRepository = userRepository;
  }

  async createProduct(input) {
    const seller = await this.userRepository.findById(input.sellerId);
    if (!seller || seller.status !== 'active') {
      throw new UnauthorizedProductActionError('El vendedor no existe o no está activo');
    }

    const product = new Product(
      '',
      input.sellerId,
      input.title,
      input.description,
      input.price,
      input.stock,
      'available',
      new Date(),
      new Date()
    );

    return this.productRepository.create(product);
  }

  async updateProduct(productId, sellerId, input) {
    const product = await this.productRepository.findById(productId);
    if (!product) throw new ProductNotFoundError(productId);
    if (product.sellerId !== sellerId) throw new UnauthorizedProductActionError();

    product.updateDetails(input);
    return this.productRepository.update(product);
  }

  async removeProduct(productId, sellerId) {
    const product = await this.productRepository.findById(productId);
    if (!product) throw new ProductNotFoundError(productId);
    if (product.sellerId !== sellerId) throw new UnauthorizedProductActionError();

    product.remove();
    await this.productRepository.update(product);
  }

  async listAvailable(limit, offset) {
    return this.productRepository.listAvailable(limit, offset);
  }

  async listBySeller(sellerId) {
    return this.productRepository.listBySeller(sellerId);
  }
}

module.exports = { ProductService, ProductNotFoundError, UnauthorizedProductActionError };
