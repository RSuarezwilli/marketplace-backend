const {
  ProductService,
  ProductNotFoundError,
  UnauthorizedProductActionError
} = require('../../../src/application/services/ProductService');
const { InMemoryProductRepository } = require('../doubles/InMemoryProductRepository');
const { InMemoryUserRepository } = require('../doubles/InMemoryUserRepository');
const { User } = require('../../../src/domain/entities/User');

describe('ProductService', () => {
  let productRepository;
  let userRepository;
  let service;
  let seller;

  beforeEach(async () => {
    productRepository = new InMemoryProductRepository();
    userRepository = new InMemoryUserRepository();
    service = new ProductService(productRepository, userRepository);

    seller = await userRepository.create(
      User.fromSupabaseAuthPayload({
        id: 'auth-seller-1',
        email: 'vendedor@example.com',
        created_at: '2026-01-01T00:00:00.000Z'
      })
    );
  });

  it('crea un producto para un vendedor activo', async () => {
    const product = await service.createProduct({
      sellerId: seller.id,
      title: 'Silla de oficina',
      description: 'Silla ergonómica poco uso',
      price: 80,
      stock: 2
    });

    expect(product.id).toBeDefined();
    expect(product.status).toBe('available');
  });

  it('rechaza crear un producto si el vendedor no existe', async () => {
    await expect(
      service.createProduct({
        sellerId: 'no-existe',
        title: 'Producto X',
        description: 'Descripción válida de prueba',
        price: 10,
        stock: 1
      })
    ).rejects.toBeInstanceOf(UnauthorizedProductActionError);
  });

  it('rechaza crear un producto si el vendedor está inactivo', async () => {
    seller.deactivate();
    await userRepository.update(seller);

    await expect(
      service.createProduct({
        sellerId: seller.id,
        title: 'Producto Y',
        description: 'Descripción válida de prueba',
        price: 10,
        stock: 1
      })
    ).rejects.toBeInstanceOf(UnauthorizedProductActionError);
  });

  it('permite al dueño actualizar su producto', async () => {
    const product = await service.createProduct({
      sellerId: seller.id,
      title: 'Mesa',
      description: 'Mesa de madera maciza',
      price: 100,
      stock: 1
    });

    const updated = await service.updateProduct(product.id, seller.id, { price: 90 });
    expect(updated.price).toBe(90);
  });

  it('impide actualizar un producto a un vendedor que no es el dueño', async () => {
    const product = await service.createProduct({
      sellerId: seller.id,
      title: 'Lámpara',
      description: 'Lámpara de mesa vintage',
      price: 30,
      stock: 3
    });

    await expect(service.updateProduct(product.id, 'otro-vendedor', { price: 20 })).rejects.toBeInstanceOf(
      UnauthorizedProductActionError
    );
  });

  it('lanza ProductNotFoundError al actualizar un producto inexistente', async () => {
    await expect(service.updateProduct('no-existe', seller.id, { price: 20 })).rejects.toBeInstanceOf(
      ProductNotFoundError
    );
  });

  it('permite al dueño eliminar (remove) su producto', async () => {
    const product = await service.createProduct({
      sellerId: seller.id,
      title: 'Teclado mecánico',
      description: 'Teclado gamer retroiluminado',
      price: 60,
      stock: 1
    });

    await service.removeProduct(product.id, seller.id);
    const available = await service.listAvailable();
    expect(available.find((p) => p.id === product.id)).toBeUndefined();
  });

  it('listAvailable() solo retorna productos disponibles', async () => {
    const p1 = await service.createProduct({
      sellerId: seller.id,
      title: 'Producto A',
      description: 'Descripción de producto A válida',
      price: 15,
      stock: 5
    });
    await service.removeProduct(p1.id, seller.id);

    await service.createProduct({
      sellerId: seller.id,
      title: 'Producto B',
      description: 'Descripción de producto B válida',
      price: 25,
      stock: 5
    });

    const available = await service.listAvailable();
    expect(available).toHaveLength(1);
    expect(available[0].title).toBe('Producto B');
  });

  it('listBySeller() (HU-11) retorna solo los productos del vendedor indicado, sin importar su estado', async () => {
    const otroVendedor = await userRepository.create(
      User.fromSupabaseAuthPayload({
        id: 'auth-seller-2',
        email: 'otro-vendedor@example.com',
        created_at: '2026-01-01T00:00:00.000Z'
      })
    );

    const propio = await service.createProduct({
      sellerId: seller.id,
      title: 'Producto propio',
      description: 'Este producto sí es del vendedor consultado',
      price: 40,
      stock: 2
    });
    await service.removeProduct(propio.id, seller.id); // incluso eliminado, debe aparecer en "mis productos"

    await service.createProduct({
      sellerId: otroVendedor.id,
      title: 'Producto de otro vendedor',
      description: 'Este NO debe aparecer en la lista del primer vendedor',
      price: 60,
      stock: 1
    });

    const misProductos = await service.listBySeller(seller.id);

    expect(misProductos).toHaveLength(1);
    expect(misProductos[0].title).toBe('Producto propio');
  });
});