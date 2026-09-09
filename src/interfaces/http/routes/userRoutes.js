const { Router } = require('express');

/** @param {import('../controllers/UserController').UserController} controller */
function buildUserRoutes(controller) {
  const router = Router();

  router.get('/me', controller.me);

  return router;
}

module.exports = { buildUserRoutes };
