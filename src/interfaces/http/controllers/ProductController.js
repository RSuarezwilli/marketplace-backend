const { createProductSchema, updateProductSchema } = require('../../../application/validators/productValidators');

class ProductController {
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
      const body = createProductSchema.parse(req.body);
      const input = { ...body, sellerId: req.currentUser.id };
      const product = await this.productService.createProduct(input);
      res.status(201).json(product);
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const input = updateProductSchema.parse(req.body);
      const product = await this.productService.updateProduct(req.params.id, req.currentUser.id, input);
      res.status(200).json(product);
    } catch (err) {
      next(err);
    }
  }

  async remove(req, res, next) {
    try {
      await this.productService.removeProduct(req.params.id, req.currentUser.id);
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
      const products = await this.productService.listBySeller(req.currentUser.id);
      res.status(200).json(products);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = { ProductController };