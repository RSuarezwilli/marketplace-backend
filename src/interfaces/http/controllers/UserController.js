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
  constructor(userProfileService) {
    this.userProfileService = userProfileService;
    this.me = this.me.bind(this);
  }

  async me(req, res, next) {
    try {
      const user = await this.userProfileService.getOwnProfile(req.currentUser.authUserId);

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
