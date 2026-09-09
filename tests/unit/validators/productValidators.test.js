const { createProductSchema, updateProductSchema } = require('../../../src/application/validators/productValidators');

describe('createProductSchema', () => {
  const valid = {
    sellerId: '11111111-1111-1111-1111-111111111111',
    title: 'Producto válido',
    description: 'Una descripción suficientemente larga',
    price: 10,
    stock: 1
  };

  it('acepta datos válidos', () => {
    expect(() => createProductSchema.parse(valid)).not.toThrow();
  });

  it('rechaza precio negativo o cero', () => {
    expect(() => createProductSchema.parse({ ...valid, price: 0 })).toThrow();
    expect(() => createProductSchema.parse({ ...valid, price: -5 })).toThrow();
  });

  it('rechaza stock negativo', () => {
    expect(() => createProductSchema.parse({ ...valid, stock: -1 })).toThrow();
  });

  it('rechaza título demasiado corto', () => {
    expect(() => createProductSchema.parse({ ...valid, title: 'ab' })).toThrow();
  });

  it('rechaza sellerId que no es UUID', () => {
    expect(() => createProductSchema.parse({ ...valid, sellerId: 'no-uuid' })).toThrow();
  });
});

describe('updateProductSchema', () => {
  it('rechaza un objeto vacío', () => {
    expect(() => updateProductSchema.parse({})).toThrow(/al menos un campo/);
  });

  it('acepta actualizar un único campo', () => {
    expect(() => updateProductSchema.parse({ price: 99 })).not.toThrow();
  });
});
