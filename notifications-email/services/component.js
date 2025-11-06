import Component from '../models/component.js'
import Template from '../models/template.js'
import { CustomError } from '../utils/customError.js'
import { extractTemplateParts } from '../utils/extractTemplateParts.js'
import { validateCreateComponent } from '../validators/component.js'

const create = async ({ name, html_content }) => {
  // Validar el nombre y el contenido html
  const validateResult = validateCreateComponent({
    name,
    html_content,
  })
  if (!validateResult.success)
    throw new CustomError(JSON.stringify(validateResult.error.flatten()), 400)

  // Extraer variables del tipo {{variable}} y components usando la función utilitaria
  const { variables: variables_accepted } = extractTemplateParts(html_content)

  const component = await Component.create([
    {
      name: validateResult.data.name,
      html_content,
      variables_accepted,
    },
  ])
  return component[0]
}

const getAll = async () => {
  const components = await Component.find({
    deleted_at: null,
  })

  return components
}

const getById = async id => {
  const component = await Component.findOne({
    _id: id,
    deleted_at: null,
  })

  if (!component) {
    throw new CustomError('Component not found', 404)
  }

  return component
}

const deleteById = async id => {
  // Chequear si el componente está en uso
  const templates = await Template.find({ deleted_at: null })
  const existantComponent = await Component.findOne({
    _id: id,
    deleted_at: null,
  })
  if (!existantComponent) throw new CustomError('Component not found', 404)
  const { name } = existantComponent

  // Buscar si algun template utiliza el componente
  // Permitir espacios opcionales antes y después del nombre del componente
  const escapeRegex = string => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

  // Crear regex para componentes simples y con children
  const regexSimple = new RegExp(`{{>\\s*${escapeRegex(name)}\\s*}}`)
  const regexWithChildren = new RegExp(
    `{{>\\s*${escapeRegex(name)}\\s*}}.*?{{/\\s*${escapeRegex(name)}\\s*}}`,
    's'
  )

  const templatesUsandoComponente = templates.filter(
    template =>
      regexSimple.test(template.raw_html) ||
      regexWithChildren.test(template.raw_html)
  )

  if (templatesUsandoComponente.length > 0)
    throw new CustomError('Component is in use', 409)

  await Component.findByIdAndUpdate(id, { deleted_at: new Date() })

  return
}

export { create, getAll, getById, deleteById }
