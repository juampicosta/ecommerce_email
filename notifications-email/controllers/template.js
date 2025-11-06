import * as service from '../services/template.js'
import { CustomError } from '../utils/customError.js'

const create = async (req, res) => {
  try {
    if (!req.file && !req.body?.raw_html) {
      throw new CustomError(
        'Debe proporcionar un archivo HTML o contenido HTML en el cuerpo de la solicitud',
        400
      )
    }
    // Si se envía un archivo HTML, leer su contenido
    let raw_html = req.body.raw_html

    if (req.file) {
      raw_html = req.file.buffer.toString('utf8')
    }

    const template = await service.create({
      name: req.body.name,
      raw_html,
    })

    return res.status(201).json({
      data: template,
    })
  } catch (error) {
    const status = error instanceof CustomError ? error.statusCode : 500
    return res.status(status).json({ error: error.message })
  }
}

const getAll = async (req, res) => {
  try {
    const templates = await service.getAll()
    return res.status(200).json({ data: templates })
  } catch (error) {
    const status = error instanceof CustomError ? error.statusCode : 500
    return res.status(status).json({ error: error.message })
  }
}

const getById = async (req, res) => {
  try {
    const { id } = req.params
    const template = await service.getById(id)

    return res.status(200).json({
      data: template,
    })
  } catch (error) {
    const status = error instanceof CustomError ? error.statusCode : 500
    return res.status(status).json({ error: error.message })
  }
}

const deleteById = async (req, res) => {
  try {
    const { id } = req.params
    await service.deleteById(id)

    return res.status(204).send()
  } catch (error) {
    const status = error instanceof CustomError ? error.statusCode : 500
    return res.status(status).json({ error: error.message })
  }
}

export { create, getAll, getById, deleteById }
