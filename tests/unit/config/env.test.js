const { loadEnv, resetEnvCache } = require('../../../src/config/env');

describe('loadEnv', () => {
  beforeEach(() => {
    resetEnvCache();
  });

  const validEnv = {
    SUPABASE_URL: 'https://project.supabase.co',
    SUPABASE_SERVICE_ROLE_KEY: 'service-role-key',
    SUPABASE_WEBHOOK_SECRET: 'whsec_test_secret'
  };

  it('carga correctamente variables válidas con valores por defecto', () => {
    const env = loadEnv(validEnv);
    expect(env.PORT).toBe(3000);
    expect(env.NODE_ENV).toBe('development');
    expect(env.RATE_LIMIT_MAX).toBe(100);
  });

  it('lanza un error si falta SUPABASE_URL', () => {
    resetEnvCache();
    const { SUPABASE_URL: _omit, ...incomplete } = validEnv;
    expect(() => loadEnv(incomplete)).toThrow(/Configuración de entorno inválida/);
  });

  it('lanza un error si SUPABASE_URL no es una URL válida', () => {
    resetEnvCache();
    expect(() => loadEnv({ ...validEnv, SUPABASE_URL: 'no-es-url' })).toThrow();
  });

  it('lanza un error si falta el secreto del webhook', () => {
    resetEnvCache();
    const { SUPABASE_WEBHOOK_SECRET: _omit, ...incomplete } = validEnv;
    expect(() => loadEnv(incomplete)).toThrow();
  });
});
