/**
 *  Servicios de escucha de eventos rabbit
 */
import { RabbitFanoutConsumer } from './tools/fanoutConsumer.js'
import * as token from '../token/token.js'

export function init() {
  const fanout = new RabbitFanoutConsumer('auth')
  fanout.addProcessor('logout', processLogout)
  fanout.init()
}

/**
 * @api {fanout} auth/logout Logout de Usuarios
 * @apiGroup RabbitMQ GET
 *
 * @apiDescription Escucha de mensajes logout desde auth.
 *
 * @apiSuccessExample {json} Mensaje
 *     {
 *        "type": "logout",
 *        "message": "{tokenId}"
 *     }
 */
function processLogout(rabbitMessage) {
  try {
    // El mensaje contiene el token a invalidar
    const tokenToInvalidate = rabbitMessage.message.split(' ')[1]
    token.invalidate(tokenToInvalidate)

    console.log('Token invalidado desde RabbitMQ:', tokenToInvalidate)
  } catch (error) {
    console.log('Error al procesar mensaje de logout desde RabbitMQ:', error)
  }
}
