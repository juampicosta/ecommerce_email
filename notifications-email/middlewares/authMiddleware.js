import * as token from '../token/token.js'
import { CustomError } from '../utils/customError.js'

async function authMiddleware(req, res, next) {
  const auth = req.header('Authorization')
  if (!auth) {
    return res.status(401).json({ error: 'No token provided' })
  }
  const bearerToken = auth.split(' ')[1]
  if (!bearerToken) {
    return res.status(401).json({ error: 'No token provided' })
  }
  try {
    const { user } = await token.validate(bearerToken)

    req.user = user
    next()
  } catch (error) {
    const status = error instanceof CustomError ? error.statusCode : 500
    res.status(status).json({ error: error.message })
  }
}
export { authMiddleware }
