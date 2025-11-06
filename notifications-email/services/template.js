import Component from '../models/component.js'
import Template from '../models/template.js'
import { CustomError } from '../utils/customError.js'
import { extractTemplateParts } from '../utils/extractTemplateParts.js'
import { replaceComponentsInHtml } from '../utils/replaceComponentsInHtml.js'
import { validateCreateTemplate } from '../validators/template.js'

const create = async ({ name, raw_html }) => {
  const validateResult = validateCreateTemplate({
    name,
    raw_html,
  })
  if (!validateResult.success)
    throw new CustomError(JSON.stringify(validateResult.error.flatten()), 400)

  // El HTML contiene components, variables, más html y texto plano
  let { components, variables: variables_accepted } =
    extractTemplateParts(raw_html)

  //Validar si existen los components
  if (components && components.length > 0) {
    for (const componentName of components) {
      const component = await Component.findOne({
        name: componentName,
        deleted_at: null,
      })

      if (!component)
        throw new CustomError(`Component ${componentName} not found`, 404)
      // Agregar variables del component a variables_accepted
      if (component.variables_accepted) {
        variables_accepted.push(...component.variables_accepted)
      }
    }
  }

  // Evitar duplicados en variables_accepted
  variables_accepted = [...new Set(variables_accepted)]

  const template = await Template.create([
    {
      name: validateResult.data.name,
      raw_html,
      variables_accepted,
    },
  ])

  return template[0]
}

const getAll = async () => {
  const templates = await Template.find({ deleted_at: null })

  const formattedTemplates = []

  for (const template of templates) {
    const htmlReplaced = await replaceComponentsInHtml(template.raw_html)
    formattedTemplates.push({
      id: template._id,
      name: template.name,
      raw_html: template.raw_html,
      replaced_html: htmlReplaced,
      variables_accepted: template.variables_accepted,
    })
  }

  return formattedTemplates
}

const getById = async id => {
  const template = await Template.findById(id)
  if (!template) throw new CustomError('Template not found', 404)
  return template
}

const deleteById = async id => {
  const template = await Template.findOneAndUpdate(
    { _id: id },
    { deleted_at: new Date() },
    { new: true }
  )

  if (!template) throw new CustomError('Template not found', 404)
  return
}

export { create, getAll, getById, deleteById }
