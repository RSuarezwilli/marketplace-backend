const { Router } = require('express');

function buildSellerRoutes(controller, requireAuth) {
  const router = Router();

  router.post('/:sellerId/reviews', requireAuth, controller.create);
  router.get('/:sellerId/reviews', controller.listBySeller);
  router.get('/:sellerId/rating', controller.getSellerRating);

  return router;
}

module.exports = { buildSellerRoutes };