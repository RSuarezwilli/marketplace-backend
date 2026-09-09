const { Router, raw } = require('express');
const { verifyWebhookSignature } = require('../middlewares/verifyWebhookSignature');

/**
 * @param {import('../controllers/AuthWebhookController').AuthWebhookController} controller
 * @param {{ SUPABASE_WEBHOOK_SECRET: string }} env
 */
function buildWebhookRoutes(controller, env) {
  const router = Router();

  // express.raw() para preservar el body exacto que firmó Supabase (necesario para Svix).
  router.post('/supabase/auth', raw({ type: 'application/json' }), verifyWebhookSignature(env.SUPABASE_WEBHOOK_SECRET), controller.handle);

  return router;
}

module.exports = { buildWebhookRoutes };
