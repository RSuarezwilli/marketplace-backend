function requireAuth(supabaseClient, userRepository) {
  return async (req, res, next) => {
    try {
      const authHeader = req.header('authorization') || req.header('Authorization') || '';
      const token = authHeader.startsWith('Bearer ') ? authHeader.slice('Bearer '.length).trim() : null;

      if (!token) {
        res.status(401).json({ error: 'Falta el token de autenticación (header Authorization: Bearer <token>)' });
        return;
      }

      const { data, error } = await supabaseClient.auth.getUser(token);
      if (error || !data || !data.user) {
        res.status(401).json({ error: 'Token inválido o expirado' });
        return;
      }

      const localUser = await userRepository.findByAuthUserId(data.user.id);
      if (!localUser) {
        res.status(404).json({ error: 'No existe un perfil local para este usuario autenticado' });
        return;
      }

      if (localUser.status !== 'active') {
        res.status(403).json({ error: 'Este usuario no está activo' });
        return;
      }

      req.currentUser = {
        id: localUser.id,
        authUserId: localUser.authUserId,
        role: localUser.role,
        status: localUser.status
      };

      next();
    } catch (err) {
      next(err);
    }
  };
}

module.exports = { requireAuth };