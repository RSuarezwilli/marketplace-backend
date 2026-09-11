const { Router } = require('express');

function buildSellerRoutes(controller, requireAuth) {
  const router = Router();

  router.get('/:sellerId/rating', controller.getSellerRating);

  router.get('/:sellerId/reviews', controller.listBySeller);
  router.post('/:sellerId/reviews', requireAuth, controller.create);

  return router;
}

module.exports = { buildSellerRoutes };