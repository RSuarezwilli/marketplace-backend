const { createClient } = require('@supabase/supabase-js');

/**
 * Factoría del cliente Supabase con la Service Role Key.
 * IMPORTANTE (seguridad): esta key tiene privilegios de administrador y
 * NUNCA debe exponerse al cliente/frontend; solo se usa en el backend
 * para operaciones de sincronización server-to-server (webhooks).
 * @param {{ SUPABASE_URL: string, SUPABASE_SERVICE_ROLE_KEY: string }} env
 */
function createSupabaseAdminClient(env) {
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

module.exports = { createSupabaseAdminClient };
