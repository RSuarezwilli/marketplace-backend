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

class InvalidProductStateError extends Error {
  constructor(message) {
    super(message);
    this.name = 'InvalidProductStateError';
  }
}

class ProductService {
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

  async listAvailable(filters) {
    return this.productRepository.listAvailable(filters);
  }

  async listBySeller(sellerId) {
    return this.productRepository.listBySeller(sellerId);
  }

  async reserveProduct(productId) {
    const product = await this.productRepository.findById(productId);
    if (!product) throw new ProductNotFoundError(productId);

    try {
      product.reserve();
    } catch (domainError) {
      throw new InvalidProductStateError(domainError.message);
    }
    return this.productRepository.update(product);
  }

  async sellProduct(productId, sellerId) {
    const product = await this.productRepository.findById(productId);
    if (!product) throw new ProductNotFoundError(productId);
    if (product.sellerId !== sellerId) throw new UnauthorizedProductActionError();

    try {
      product.markSold();
    } catch (domainError) {
      throw new InvalidProductStateError(domainError.message);
    }
    return this.productRepository.update(product);
  }
}

module.exports = { ProductService, ProductNotFoundError, UnauthorizedProductActionError, InvalidProductStateError };