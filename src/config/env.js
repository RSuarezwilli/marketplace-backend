const { z } = require('zod');

/**
 * Esquema y validación estricta de variables de entorno.
 * Falla rápido (fail-fast) al arrancar si falta configuración crítica,
 * en lugar de fallar silenciosamente en producción (buena práctica de seguridad).
 */
const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  SUPABASE_ANON_KEY: z.string().min(1).optional(),
  SUPABASE_WEBHOOK_SECRET: z.string().min(1),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100)
});

let cachedEnv = null;

/**
 * @param {NodeJS.ProcessEnv} [source]
 */
function loadEnv(source = process.env) {
  if (cachedEnv) return cachedEnv;
  const parsed = envSchema.safeParse(source);
  if (!parsed.success) {
    const details = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
    throw new Error(`Configuración de entorno inválida -> ${details}`);
  }
  cachedEnv = parsed.data;
  return cachedEnv;
}

function resetEnvCache() {
  cachedEnv = null;
}

module.exports = { loadEnv, resetEnvCache };
