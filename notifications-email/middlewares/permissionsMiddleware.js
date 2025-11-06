async function permissionsMiddleware(req, res, next) {
  const user = req.user
  if (!user) {
    return res
      .status(403)
      .json({ error: 'No tienes permisos para acceder a este recurso' })
  }
  const permissions = user.permissions || []
  if (!permissions.includes('admin')) {
    return res
      .status(403)
      .json({ error: 'No tienes permisos para acceder a este recurso' })
  }

  next()
}

export { permissionsMiddleware }
