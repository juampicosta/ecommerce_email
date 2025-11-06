'use strict'

import { RabbitDirectEmitter } from './tools/directEmitter'
import { IRabbitMessage } from './tools/common'
import * as appConfig from '../server/environment'
const conf = appConfig.getConfig(process.env)

/**
 * @api {direct} notifications/send-email Enviar Email de Deshabilitación de Usuario
 * @apiGroup RabbitMQ POST
 *
 * @apiDescription Auth envía un mensaje de email cuando se deshabilita un usuario.
 *
 * @apiExample {json} Mensaje
 *     {
 *        "type": "send-email",
 *        "queue": "email-notifications",
 *        "exchange": "notifications",
 *         "message": {
 *             "type": "send-email",
 *             "to_email": "usuario@example.com",
 *             "subject": "Tu cuenta ha sido deshabilitada",
 *             "template_id": "68a5dfaafe1eb1ed05b0ac62",
 *             "variables": [
 *                 { "name": "nombre_usuario", "value": "Usuario" },
 *                 { "name": "page_title", "value": "Cuenta deshabilitada" }
 *             ]
 *        }
 *     }
 */
export async function sendDisableEmailNotification(
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
      subject: 'Tu cuenta ha sido deshabilitada',
      template_id: conf.disableUserTemplateId,
      variables: [
        { name: 'nombre_usuario', value: userName },
        { name: 'email_usuario', value: userEmail },
        { name: 'page_title', value: 'Cuenta deshabilitada' }
      ]
    }
  }

  return RabbitDirectEmitter.getEmitter(
    'email-notifications',
    'notifications'
  ).send(message)
}
