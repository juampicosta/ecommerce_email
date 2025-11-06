import { RabbitDirectConsumer } from './tools/directConsumer.js'
import { create } from '../services/email.js'

/**
 * @api {direct} notifications/send-template-email Envío de Email con Template
 * @apiGroup RabbitMQ GET
 *
 * @apiDescription Escucha de mensajes send-template-email desde notifications. Procesa y envía emails con templates
 *
 * @apiSuccessExample {json} Mensaje
 *     {
 *        "to_email": "usuario@email.com",
 *        "subject": "Newsletter",
 *        "template_id": "6507f1f130c72319ebf28a8c",
 *        "variables": {
 *            "nombre": "Juan",
 *            "fecha": "2025-09-22"
 *        }
 *     }
 */
async function processTemplateEmail(rabbitMessage) {
  console.log('Procesando email con template:', rabbitMessage)
  try {
    const { to_email, subject, template_id, variables } = rabbitMessage.message
    await create({
      subject,
      to_email,
      template_id,
      variables,
    })

    console.log('✅ Email con template enviado correctamente a:', to_email)
  } catch (error) {
    console.error('❌ Error enviando email con template:', error)
  }
}

/**
 * Inicialización de consumers
 */
export function init() {
  const emailConsumer = new RabbitDirectConsumer(
    'email-notifications',
    'notifications'
  )
  emailConsumer.addProcessor('send-email', processTemplateEmail)
  emailConsumer.init()
}
