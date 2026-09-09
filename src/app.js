const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const { createSupabaseAdminClient } = require('./infrastructure/supabase/SupabaseClient');
const { SupabaseUserRepository } = require('./infrastructure/repositories/SupabaseUserRepository');
const { SupabaseProductRepository } = require('./infrastructure/repositories/SupabaseProductRepository');
const { UserSyncService } = require('./application/services/UserSyncService');
const { ProductService } = require('./application/services/ProductService');
const { UserProfileService } = require('./application/services/UserProfileService');
const { AuthWebhookController } = require('./interfaces/http/controllers/AuthWebhookController');
const { ProductController } = require('./interfaces/http/controllers/ProductController');
const { UserController } = require('./interfaces/http/controllers/UserController');
const { buildWebhookRoutes } = require('./interfaces/http/routes/webhookRoutes');
const { buildProductRoutes } = require('./interfaces/http/routes/productRoutes');
const { buildUserRoutes } = require('./interfaces/http/routes/userRoutes');
const { errorHandler } = require('./interfaces/http/middlewares/errorHandler');

/**
 * Composition root: aquí se conectan (inyectan) todas las dependencias
 * concretas sobre los contratos del dominio. Mantener este ensamblado
 * en un único lugar facilita sustituir infraestructura (p.ej. en tests
 * de integración) sin tocar la lógica de negocio.
 * @param {ReturnType<typeof import('./config/env').loadEnv>} env
 */
function buildApp(env) {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(
    rateLimit({
      windowMs: env.RATE_LIMIT_WINDOW_MS,
      max: env.RATE_LIMIT_MAX,
      standardHeaders: true,
      legacyHeaders: false
    })
  );

  const supabase = createSupabaseAdminClient(env);
  const userRepository = new SupabaseUserRepository(supabase);
  const productRepository = new SupabaseProductRepository(supabase);

  const userSyncService = new UserSyncService(userRepository);
  const productService = new ProductService(productRepository, userRepository);
  const userProfileService = new UserProfileService(userRepository);

  const authWebhookController = new AuthWebhookController(userSyncService);
  const productController = new ProductController(productService);
  const userController = new UserController(userProfileService);

  // Ruta de webhook ANTES del json() global, porque necesita el body crudo.
  app.use('/webhooks', buildWebhookRoutes(authWebhookController, env));

  app.use(express.json({ limit: '1mb' }));

  app.get('/health', (_req, res) => res.status(200).json({ status: 'ok' }));
  app.use('/products', buildProductRoutes(productController));
  app.use('/users', buildUserRoutes(userController));

  app.use(errorHandler);

  return app;
}

module.exports = { buildApp };
