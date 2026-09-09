const { Webhook } = require('svix');

/**
 * Middleware de seguridad: verifica la firma criptográfica del webhook
 * de Supabase Auth (Auth Hooks usan el estándar Svix) antes de procesar
 * el payload. Esto evita que un tercero falsifique eventos de creación/
 * eliminación de usuarios (uplift de privilegios, envenenamiento de datos).
 *
 * Requiere que el body crudo (raw) esté disponible en `req.body` como Buffer,
 * ver configuración de express.raw() en app.js para esta ruta específica.
 * @param {string} secret
 */
function verifyWebhookSignature(secret) {
  return (req, res, next) => {
    try {
      const payload = req.body;
      const headers = {
        'svix-id': req.header('svix-id') || '',
        'svix-timestamp': req.header('svix-timestamp') || '',
        'svix-signature': req.header('svix-signature') || ''
      };

      if (!headers['svix-id'] || !headers['svix-timestamp'] || !headers['svix-signature']) {
        res.status(401).json({ error: 'Cabeceras de firma faltantes' });
        return;
      }

      const wh = new Webhook(secret);
      const verified = wh.verify(payload, headers);

      // Reemplaza el body crudo por el JSON ya verificado y parseado.
      req.body = verified;
      next();
    } catch {
      res.status(401).json({ error: 'Firma de webhook inválida' });
    }
  };
}

module.exports = { verifyWebhookSignature };
