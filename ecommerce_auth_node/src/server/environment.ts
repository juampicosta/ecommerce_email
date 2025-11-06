'use strict'

import * as dotenv from 'dotenv'
let config: Config

/*
Todas las configuraciones del servidor se encuentran en este modulo, si se quiere
acceder desde cualquier parte del sistema, se deben acceder llamando a este metodo.
*/
export function getConfig(environment: any): Config {
  if (!config) {
    // El archivo .env es un archivo que si esta presente se leen las propiedades
    // desde ese archivo, sino se toman estas de aca para entorno dev.
    // .env es un archivo que no se debería subir al repo y cada server debería tener el suyo
    dotenv.config({ path: '.env' })

    config = {
      port: process.env.SERVER_PORT || '3000',
      logLevel: process.env.LOG_LEVEL || 'debug',
      mongoDb: process.env.MONGO_URL || 'mongodb://localhost/authentication',
      jwtSecret: process.env.JWT_SECRET || '+b59WQF+kUDr0TGxevzpRV3ixMvyIQuD1O',
      passwordSalt:
        process.env.PASSWORD_SALT ||
        'DP3whK1fL7kKvhWm6pZomM/y8tZ92mkEBtj29A4M+b8',
      rabbitUrl: process.env.RABBIT_URL || 'amqp://localhost',
      signupTemplateId:
        process.env.SIGNUP_TEMPLATE_ID || '68a503258bcf37c230cd71bc',
      disableUserTemplateId:
        process.env.DISABLE_USER_TEMPLATE_ID || '68d4567b22aea0028709c4dc',
      changePasswordTemplateId:
        process.env.CHANGE_PASSWORD_TEMPLATE_ID || '68a5dfaafe1eb1ed05b0ac62'
    }
  }
  return config
}

export interface Config {
  port: string
  logLevel: string // 'debug' | 'verbose' | 'info' | 'warn' | 'error';
  mongoDb: string
  passwordSalt: string
  jwtSecret: string
  rabbitUrl: string
  signupTemplateId: string
  disableUserTemplateId: string
  changePasswordTemplateId: string
}
