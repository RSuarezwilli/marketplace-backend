const { Router } = require('express');

function buildProductRoutes(controller, requireAuth) {
  const router = Router();

  // Pública: cualquiera puede explorar el catálogo, sin iniciar sesión.
  router.get('/', controller.listAvailable);

  // Protegidas: requieren un token válido de Supabase Auth.
  router.get('/mine', requireAuth, controller.listMine);
  router.post('/', requireAuth, controller.create);
  router.patch('/:id', requireAuth, controller.update);
  router.delete('/:id', requireAuth, controller.remove);

  return router;
}

module.exports = { buildProductRoutes };