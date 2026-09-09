const { parseAuthWebhookEvent } = require('../../../application/validators/authWebhookValidators');

class AuthWebhookController {
  /** @param {import('../../../application/services/UserSyncService').UserSyncService} userSyncService */
  constructor(userSyncService) {
    this.userSyncService = userSyncService;

    // Enlazamos `this` explícitamente para poder pasar el método directo a Express.
    this.handle = this.handle.bind(this);
  }

  async handle(req, res, next) {
    try {
      const event = parseAuthWebhookEvent(req.body);
      const user = await this.userSyncService.handleAuthEvent(event);
      res.status(200).json({ status: 'synced', userId: user.id });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = { AuthWebhookController };
