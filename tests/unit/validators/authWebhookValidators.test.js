const { parseAuthWebhookEvent } = require('../../../src/application/validators/authWebhookValidators');

describe('parseAuthWebhookEvent', () => {
  const validPayload = {
    type: 'user.created',
    record: {
      id: '11111111-1111-1111-1111-111111111111',
      email: 'valido@example.com',
      user_metadata: { full_name: 'Nombre Válido' },
      created_at: '2026-01-01T00:00:00.000Z'
    }
  };

  it('acepta un payload válido', () => {
    expect(() => parseAuthWebhookEvent(validPayload)).not.toThrow();
  });

  it('rechaza un tipo de evento no soportado', () => {
    const invalid = { ...validPayload, type: 'user.something' };
    expect(() => parseAuthWebhookEvent(invalid)).toThrow(/Payload de webhook inválido/);
  });

  it('rechaza un id que no es UUID', () => {
    const invalid = { ...validPayload, record: { ...validPayload.record, id: 'no-uuid' } };
    expect(() => parseAuthWebhookEvent(invalid)).toThrow();
  });

  it('rechaza un email inválido', () => {
    const invalid = { ...validPayload, record: { ...validPayload.record, email: 'no-es-email' } };
    expect(() => parseAuthWebhookEvent(invalid)).toThrow();
  });

  it('rechaza un payload sin el campo record', () => {
    expect(() => parseAuthWebhookEvent({ type: 'user.created' })).toThrow();
  });
});
