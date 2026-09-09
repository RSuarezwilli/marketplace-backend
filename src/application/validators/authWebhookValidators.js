const { z } = require('zod');

/**
 * Esquema del payload que Supabase Auth envía en sus webhooks (Auth Hooks)
 * para eventos del ciclo de vida del usuario. Se valida estrictamente
 * antes de tocar cualquier lógica de negocio (defensa en profundidad).
 */
const supabaseAuthUserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  user_metadata: z.record(z.unknown()).nullable().optional(),
  created_at: z.string()
});

const supabaseAuthWebhookEventSchema = z.object({
  type: z.enum(['user.created', 'user.updated', 'user.deleted']),
  record: supabaseAuthUserSchema
});

/**
 * @param {unknown} payload
 */
function parseAuthWebhookEvent(payload) {
  const result = supabaseAuthWebhookEventSchema.safeParse(payload);
  if (!result.success) {
    throw new Error(`Payload de webhook inválido: ${result.error.message}`);
  }
  return result.data;
}

module.exports = { supabaseAuthUserSchema, supabaseAuthWebhookEventSchema, parseAuthWebhookEvent };
