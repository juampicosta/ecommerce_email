'use strict'

import { RabbitDirectEmitter } from './tools/directEmitter'
import { IRabbitMessage } from './tools/common'
import * as appConfig from '../server/environment'
const conf = appConfig.getConfig(process.env)

/**
 * @api {direct} notifications/send-email Enviar Email de Cambio de Contraseña
 * @apiGroup RabbitMQ POST
 *
 * @apiDescription Auth envía un mensaje de email cuando se cambia la contraseña de un usuario.
 *
 * @apiExample {json} Mensaje
 *     {
 *        "type": "send-email",
 *        "queue": "email-notifications",
 *        "exchange": "notifications",
 *         "message": {
 *             "type": "send-email",
 *             "to_email": "usuario@example.com",
 *             "subject": "Tu contraseña ha sido cambiada exitosamente",
 *             "template_id": "68a5dfaafe1eb1ed05b0ac62",
 *             "variables": [
 *                 { "name": "nombre_usuario", "value": "Usuario" },
 *                 { "name": "page_title", "value": "Contraseña cambiada" }
 *             ]
 *        }
 *     }
 */
export async function sendPasswordChangeEmailNotification(
  userEmail: string,
  userName: string
): Promise<IRabbitMessage> {
  const message: IRabbitMessage = {
    type: 'send-email',
    exchange: 'notifications',
    queue: 'email-notifications',
    message: {
      type: 'send-email',
      to_email: userEmail,
      subject: 'Tu contraseña ha sido cambiada exitosamente',
      template_id: conf.changePasswordTemplateId,
      variables: [
        { name: 'nombre_usuario', value: userName },
        { name: 'page_title', value: 'Contraseña cambiada exitosamente' }
      ]
    }
  }

  return RabbitDirectEmitter.getEmitter(
    'email-notifications',
    'notifications'
  ).send(message)
}
