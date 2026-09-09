const { Router } = require('express');

/** @param {import('../controllers/ProductController').ProductController} controller */
function buildProductRoutes(controller) {
  const router = Router();

  router.get('/', controller.listAvailable);
  router.post('/', controller.create);
  router.patch('/:id', controller.update);
  router.delete('/:id', controller.remove);

  return router;
}

module.exports = { buildProductRoutes };
