const { ZodError } = require('zod');
const { ProductNotFoundError, UnauthorizedProductActionError } = require('../../../application/services/ProductService');
const { UserNotFoundError } = require('../../../application/services/UserProfileService');

/**
 * Manejador de errores centralizado. Traduce errores de dominio/aplicación
 * a códigos HTTP apropiados y evita filtrar detalles internos (stack traces,
 * mensajes de infraestructura) al cliente en producción.
 */
function errorHandler(err, _req, res, _next) {
  if (err instanceof ZodError) {
    res.status(400).json({ error: 'Datos de entrada inválidos', details: err.issues });
    return;
  }

  if (err instanceof ProductNotFoundError) {
    res.status(404).json({ error: err.message });
    return;
  }

  if (err instanceof UnauthorizedProductActionError) {
    res.status(403).json({ error: err.message });
    return;
  }

  if (err instanceof UserNotFoundError) {
    res.status(404).json({ error: err.message });
    return;
  }

  if (err instanceof Error) {
    // eslint-disable-next-line no-console
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
    return;
  }

  res.status(500).json({ error: 'Error interno del servidor' });
}

module.exports = { errorHandler };
