import * as service from '../services/component.js'
import { CustomError } from '../utils/customError.js'

const create = async (req, res) => {
  try {
    if (!req.file && !req.body?.html_content) {
      throw new CustomError(
        'Debe proporcionar un archivo HTML o contenido HTML en el cuerpo de la solicitud',
        400
      )
    }
    // Si se envía un archivo HTML, leer su contenido
    let html_content = req.body.html_content

    if (req.file) {
      html_content = req.file.buffer.toString('utf8')
    }

    const { name } = req.body

    const component = await service.create({
      name,
      html_content,
    })

    return res.status(201).json({
      data: component,
    })
  } catch (error) {
    const status = error instanceof CustomError ? error.statusCode : 500
    return res.status(status).json({ error: error.message })
  }
}

const getAll = async (req, res) => {
  try {
    const components = await service.getAll()

    return res.status(200).json({
      data: components,
    })
  } catch (error) {
    const status = error instanceof CustomError ? error.statusCode : 500
    return res.status(status).json({ error: error.message })
  }
}

const getById = async (req, res) => {
  try {
    const { id } = req.params
    const component = await service.getById(id)

    return res.status(200).json({
      data: component,
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
