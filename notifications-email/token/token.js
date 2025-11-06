import NodeCache from 'node-cache'
import { CustomError } from '../utils/customError.js'

// 5 horas de cache en memoria. Luego se vuelve a leer de la db
const sessionCache = new NodeCache({ stdTTL: 3600 * 5, checkperiod: 60 })

export async function validate(token) {
  /*
    Mantenemos un listado en memoria, si el token no esta en memoria, se busca en el
    servidor de autenticación.
  */

  const cachedSession = sessionCache.get(token)

  if (!cachedSession) {
    // Call to auth service and update cache

    const response = await fetch(
      `${process.env.AUTH_SERVICE_URL}/users/current`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    )
    if (!response.ok) {
      throw new CustomError('Invalid token', 401)
    }

    const user = await response.json()
    cacheSession(token, user)

    return {
      token,
      user,
    }
  }

  return {
    token,
    user: cachedSession,
  }
}

export function invalidate(token) {
  if (sessionCache.get(token)) {
    sessionCache.del(token)
    console.log('RabbitMQ session invalidada ' + token)
  }
}

export function cacheSession(token, user) {
  if (token && user) {
    sessionCache.set(token, user)
    console.log('RabbitMQ session guardada en cache:', token)
  }
  return
}
