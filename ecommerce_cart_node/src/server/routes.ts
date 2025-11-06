'use strict'

import { Express } from 'express'
import * as token from '../token'
import * as cart from '../cart'
import * as error from './error'
import * as express from 'express'
import { NextFunction } from 'connect'

/**
 * Modulo de seguridad, login/logout, cambio de contraseñas, etc
 */
export function init(app: Express) {
  app.route('/cart/article').post(validateToken, addArticle)
  app.route('/cart').get(validateToken, getCart)
  app.route('/cart/article/:articleId').delete(validateToken, deleteArticle)
  app
    .route('/cart/article/:articleId/increment')
    .post(validateToken, incrementArticle)
  app
    .route('/cart/article/:articleId/decrement')
    .post(validateToken, decrementArticle)
  app.route('/cart/validate').get(validateToken, validateCheckout)
  app.route('/cart/checkout').post(validateToken, postOrder)
}

interface IUserSessionRequest extends express.Request {
  user: token.ISession
}

/**
 * @apiDefine AuthHeader
 *
 * @apiExample {String} Header Autorización
 *    Authorization=bearer {token}
 *
 * @apiErrorExample 401 Unauthorized
 *    HTTP/1.1 401 Unauthorized
 */
async function validateToken(
  req: IUserSessionRequest,
  res: express.Response,
  next: NextFunction
) {
  const auth = req.header('Authorization')

  if (!auth) {
    return error.handle(
      res,
      error.newError(error.ERROR_UNAUTHORIZED, 'Unauthorized')
    )
  }

  token
    .validate(auth)
    .then((user) => {
      console.log('User validated', user)
      req.user = user
      next()
    })
    .catch((err) => error.handle(res, err))
}

/**
 * @api {post} /cart/article Agregar Artículo
 * @apiName Agregar Artículo
 * @apiGroup Carrito
 *
 * @apiDescription Agregar artículos al carrito.
 *
 * @apiExample {json} Body
 *    {
 *      "articleId": "{Article Id}",
 *      "quantity": {Quantity to add}
 *    }
 *
 * @apiSuccessExample {json} Body
 *    {
 *      "userId": "{User Id}",
 *      "enabled": true|false,
 *      "id": "{Id de carrito}",
 *      "articles": [{Artículos}],
 *      "updated": "{Fecha ultima actualización}",
 *      "created": "{Fecha creado}"
 *    }
 *
 * @apiUse ParamValidationErrors
 * @apiUse OtherErrors
 */
function addArticle(req: IUserSessionRequest, res: express.Response) {
  cart
    .addArticle(req.user.user.id, req.body)
    .then((cart) => {
      res.json(cart)
    })
    .catch((err) => {
      error.handle(res, err)
    })
}

/**
 * @api {post} /cart/article/:articleId/decrement Decrementar
 * @apiName Decrementar Cart
 * @apiGroup Carrito
 *
 * @apiDescription Decrementa la cantidad de artículos en el cart.
 *
 * @apiSuccessExample {json} Body
 *    {
 *      "articleId": "{Article Id}",
 *      "quantity": {articles to decrement}
 *    }
 *
 * @apiSuccessExample {json} Body
 *    {
 *      "userId": "{User Id}",
 *      "enabled": true|false,
 *      "_id": "{Id de carrito}",
 *      "articles": [{Artículos}],
 *      "updated": "{Fecha ultima actualización}",
 *      "created": "{Fecha creado}"
 *    }
 *
 * @apiUse ParamValidationErrors
 * @apiUse OtherErrors
 */
function decrementArticle(req: IUserSessionRequest, res: express.Response) {
  cart
    .decrementArticle(req.user.user.id, req.body)
    .then((cart) => {
      res.json(cart)
    })
    .catch((err) => {
      error.handle(res, err)
    })
}

/**
 * @api {post} /cart/article/:articleId/increment Incrementar
 * @apiName Incrementar Cart
 * @apiGroup Carrito
 *
 * @apiDescription Incrementa la cantidad de artículos en el cart.
 *
 * @apiSuccessExample {json} Body
 *    {
 *      "articleId": "{Article Id}",
 *      "quantity": {articles to increment},
 *      "validated": True|False Determina si el articulo se valido en catalog
 *    }
 *
 * @apiSuccessExample {json} Body
 *    {
 *      "userId": "{User Id}",
 *      "enabled": true|false,
 *      "_id": "{Id de carrito}",
 *      "articles": [{Artículos}],
 *      "updated": "{Fecha ultima actualización}",
 *      "created": "{Fecha creado}"
 *    }
 *
 * @apiUse ParamValidationErrors
 * @apiUse OtherErrors
 */
function incrementArticle(req: IUserSessionRequest, res: express.Response) {
  cart
    .addArticle(req.user.user.id, req.body)
    .then((cart) => {
      res.json(cart)
    })
    .catch((err) => {
      error.handle(res, err)
    })
}

/**
 * @api {get} /cart Obtener Carrito
 * @apiName Obtener Carrito
 * @apiGroup Carrito
 *
 * @apiDescription Devuelve el carrito activo.
 *
 * @apiSuccessExample {json} Body
 *    {
 *      "userId": "{User Id}",
 *      "enabled": true|false,
 *      "_id": "{Id de carrito}",
 *      "articles": [{Artículos}],
 *      "updated": "{Fecha ultima actualización}",
 *      "created": "{Fecha creado}"
 *    }
 *
 * @apiUse ParamValidationErrors
 * @apiUse OtherErrors
 */
function getCart(req: IUserSessionRequest, res: express.Response) {
  console.log(req.user)
  cart
    .currentCart(req.user.user.id)
    .then((cart) => {
      res.json(cart)
    })
    .catch((err) => {
      error.handle(res, err)
    })
}

/**
 * @api {delete} /cart/article/:articleId Quitar Artículo
 * @apiName Quitar Artículo
 * @apiGroup Carrito
 *
 * @apiDescription Eliminar un articulo del carrito.
 *
 * @apiSuccessExample {string} Body
 *    HTTP/1.1 200 Ok
 *
 * @apiUse ParamValidationErrors
 * @apiUse OtherErrors
 */
function deleteArticle(req: IUserSessionRequest, res: express.Response) {
  const articleId = escape(req.params.articleId)

  cart
    .deleteArticle(req.user.user.id, articleId)
    .then((_) => {
      res.send()
    })
    .catch((err) => {
      error.handle(res, err)
    })
}

/**
 * @api {post} /cart/validate Validar Carrito
 * @apiName Validar Carrito
 * @apiGroup Carrito
 *
 * @apiDescription Realiza una validación completa del cart, para realizar el checkout.
 *
 * @apiSuccessExample {json} Body
 *   {
 *      "errors": [
 *          {  "articleId": "{Article}",
 *             "message" : "{Error message}"
 *          }, ...],
 *      "warnings": [
 *          {  "articleId": "{Article}",
 *             "message" : "{Error message}"
 *          }, ...]
 *    }
 *
 * @apiUse ParamValidationErrors
 * @apiUse OtherErrors
 */
function validateCheckout(req: IUserSessionRequest, res: express.Response) {
  cart
    .validateCheckout(req.user.user.id, req.user.token)
    .then((validation) => {
      res.json(validation)
    })
    .catch((err) => {
      error.handle(res, err)
    })
}

/**
 * @api {post} /cart/checkout Checkout
 * @apiName Checkout
 * @apiGroup Carrito
 *
 * @apiDescription Realiza el checkout del carrito.
 *
 * @apiSuccessExample {string} Body
 *    HTTP/1.1 200 Ok
 *
 * @apiUse ParamValidationErrors
 * @apiUse OtherErrors
 */
function postOrder(req: IUserSessionRequest, res: express.Response) {
  cart
    .placeOrder(req.user.user)
    .then((_) => {
      res.send()
    })
    .catch((err) => {
      error.handle(res, err)
    })
}
