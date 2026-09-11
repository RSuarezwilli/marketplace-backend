const { Router } = require('express');

function buildProductRoutes(controller, requireAuth) {
  const router = Router();

  router.get('/', controller.listAvailable);

  router.get('/mine', requireAuth, controller.listMine);
  router.post('/', requireAuth, controller.create);
  router.patch('/:id', requireAuth, controller.update);
  router.patch('/:id/reserve', requireAuth, controller.reserve);
  router.patch('/:id/sell', requireAuth, controller.sell);
  router.delete('/:id', requireAuth, controller.remove);

  return router;
}

module.exports = { buildProductRoutes };