"use strict";

import { IRabbitMessage, sendMessage } from "./rabbit";

/**
 * @api {fanout} auth/fanout Invalidar Token
 * @apiGroup RabbitMQ POST
 *
 * @apiDescription AuthService enviá un broadcast a todos los usuarios cuando un token ha sido invalidado. Los clientes deben eliminar de sus caches las sesiones invalidadas.
 *
 * @apiSuccessExample {json} Mensaje
 *     {
 *        "type": "logout",
 *        "message": "{Token revocado}"
 *     }
 */
export function sendLogout(token: string): Promise<IRabbitMessage> {
    return sendMessage({
        type: "logout",
        message: token
    });
}
