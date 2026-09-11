const { Router } = require('express');

function buildUserRoutes(controller, requireAuth) {
  const router = Router();

  router.get('/me', requireAuth, controller.me);

  return router;
}

module.exports = { buildUserRoutes };