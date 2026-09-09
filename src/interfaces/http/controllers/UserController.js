/**
 * UserController: expone el perfil del usuario autenticado.
 *
 * NOTA DE SEGURIDAD (deuda técnica conocida, ver progress.md):
 * por ahora el id del usuario autenticado se toma del header `x-user-id`
 * como marcador de posición, igual que en ProductController. Antes de
 * producción esto DEBE reemplazarse por un middleware que verifique el
 * JWT de Supabase (`Authorization: Bearer <token>`) y derive el
 * `authUserId` desde ahí, nunca de un header no verificado por el cliente.
 */
class UserController {
  /** @param {import('../../../application/services/UserProfileService').UserProfileService} userProfileService */
  constructor(userProfileService) {
    this.userProfileService = userProfileService;
    this.me = this.me.bind(this);
  }

  async me(req, res, next) {
    try {
      const authUserId = req.header('x-user-id') || '';
      if (!authUserId) {
        res.status(401).json({ error: 'Falta el header x-user-id (marcador de posición de autenticación)' });
        return;
      }

      const user = await this.userProfileService.getOwnProfile(authUserId);

      // Se expone solo lo necesario: nunca se filtran campos internos de más.
      res.status(200).json({
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = { UserController };
