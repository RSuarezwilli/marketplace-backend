const { ZodError } = require('zod');
const {
  ProductNotFoundError,
  UnauthorizedProductActionError,
  InvalidProductStateError
} = require('../../../application/services/ProductService');
const { UserNotFoundError } = require('../../../application/services/UserProfileService');

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

  if (err instanceof InvalidProductStateError) {
    res.status(409).json({ error: err.message });
    return;
  }

  if (err instanceof UserNotFoundError) {
    res.status(404).json({ error: err.message });
    return;
  }

  if (err instanceof Error) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
    return;
  }

  res.status(500).json({ error: 'Error interno del servidor' });
}

module.exports = { errorHandler };