import { CustomError } from '../utils/customError.js'
import * as EmailService from '../services/email.js'

const create = async (req, res) => {
  try {
    const email = await EmailService.create(req.body)

    return res.status(201).json({
      data: email,
    })
  } catch (error) {
    const status = error instanceof CustomError ? error.statusCode : 500
    return res.status(status).json({ error: error.message })
  }
}

export { create }
