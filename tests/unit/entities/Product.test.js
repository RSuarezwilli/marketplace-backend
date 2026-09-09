const { Product } = require('../../../src/domain/entities/Product');

function buildProduct(overrides = {}) {
  return new Product(
    'p-1',
    'seller-1',
    'Bicicleta',
    'Bicicleta usada en buen estado',
    150,
    1,
    overrides.status || 'available',
    new Date(),
    new Date()
  );
}

describe('Product (entidad de dominio)', () => {
  it('reserve() cambia el estado a reserved si está disponible', () => {
    const product = buildProduct();
    product.reserve();
    expect(product.status).toBe('reserved');
  });

  it('reserve() lanza error si el producto no está disponible', () => {
    const product = buildProduct({ status: 'sold' });
    expect(() => product.reserve()).toThrow(/Solo un producto disponible/);
  });

  it('markSold() cambia el estado a sold', () => {
    const product = buildProduct();
    product.markSold();
    expect(product.status).toBe('sold');
  });

  it('markSold() lanza error si el producto fue eliminado', () => {
    const product = buildProduct({ status: 'removed' });
    expect(() => product.markSold()).toThrow(/producto eliminado/);
  });

  it('updateDetails() valida que el precio no sea negativo', () => {
    const product = buildProduct();
    expect(() => product.updateDetails({ price: -10 })).toThrow(/precio no puede ser negativo/);
  });

  it('updateDetails() valida que el stock no sea negativo', () => {
    const product = buildProduct();
    expect(() => product.updateDetails({ stock: -1 })).toThrow(/stock no puede ser negativo/);
  });

  it('updateDetails() actualiza únicamente los campos provistos', () => {
    const product = buildProduct();
    product.updateDetails({ title: 'Bicicleta de montaña' });
    expect(product.title).toBe('Bicicleta de montaña');
    expect(product.price).toBe(150);
  });
});
