'use strict'

import * as express from 'express'
import * as passport from 'passport'
import { ISessionRequest } from '../domain/token/passport'
import * as user from '../domain/user'
import * as error from '../server/error'
import { sendPasswordChangeEmailNotification } from '../rabbit/send_password_change'

/**
 * Modulo de seguridad, login/logout, cambio de contraseñas, etc
 */
export function init(app: express.Express) {
  app
    .route('/users/password')
    .post(passport.authenticate('jwt', { session: false }), changePassword)
}

/**
 * @api {post} /users/password Cambiar Password
 * @apiName Cambiar Password
 * @apiGroup Seguridad
 *
 * @apiDescription Cambia la contraseña del usuario actual.
 *
 * @apiExample {json} Body
 *    {
 *      "currentPassword" : "{Contraseña actual}",
 *      "newPassword" : "{Nueva Contraseña}",
 *    }
 *
 * @apiSuccessExample {json} Respuesta
 *     HTTP/1.1 200 OK
 *
 * @apiUse AuthHeader
 * @apiUse ParamValidationErrors
 * @apiUse OtherErrors
 */
async function changePassword(req: ISessionRequest, res: express.Response) {
  try {
    // Obtener los datos del usuario antes de cambiar la contraseña
    const userData = await user.findById(req.user.user_id)

    await user.changePassword(req.user.user_id, req.body)

    // Enviar email de notificación
    await sendPasswordChangeEmailNotification(userData.email, userData.name)

    res.send()
  } catch (err) {
    error.handle(res, err)
  }
}
