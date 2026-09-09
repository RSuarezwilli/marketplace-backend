const { createProductSchema, updateProductSchema } = require('../../../application/validators/productValidators');

class ProductController {
  /** @param {import('../../../application/services/ProductService').ProductService} productService */
  constructor(productService) {
    this.productService = productService;

    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.remove = this.remove.bind(this);
    this.listAvailable = this.listAvailable.bind(this);
    this.listMine = this.listMine.bind(this); 
}



  async create(req, res, next) {
    try {
      const input = createProductSchema.parse(req.body);
      const product = await this.productService.createProduct(input);
      res.status(201).json(product);
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const input = updateProductSchema.parse(req.body);
      const sellerId = req.header('x-user-id') || '';
      const product = await this.productService.updateProduct(req.params.id, sellerId, input);
      res.status(200).json(product);
    } catch (err) {
      next(err);
    }
  }

  async remove(req, res, next) {
    try {
      const sellerId = req.header('x-user-id') || '';
      await this.productService.removeProduct(req.params.id, sellerId);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }

  async listAvailable(req, res, next) {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : undefined;
      const offset = req.query.offset ? Number(req.query.offset) : undefined;
      const products = await this.productService.listAvailable(limit, offset);
      res.status(200).json(products);
    } catch (err) {
      next(err);
    }
  }

  async listMine(req, res, next) {
    try {
      const sellerId = req.header('x-user-id') || '';
      if (!sellerId) {
        res.status(401).json({ error: 'Falta el header x-user-id (marcador de posición de autenticación)' });
        return;
      }
      const products = await this.productService.listBySeller(sellerId);
      res.status(200).json(products);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = { ProductController };
