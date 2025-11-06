import Email from '../models/email.js'
import Template from '../models/template.js'
import { CustomError } from '../utils/customError.js'
import { sendEmail } from '../utils/handleEmail.js'
import { replaceComponentsInHtml } from '../utils/replaceComponentsInHtml.js'
import { replaceVariablesInHtml } from '../utils/replaceVariablesInHtml.js'
import { validateCreateEmail } from '../validators/email.js'

const create = async ({ subject, to_email, template_id, variables }) => {
  const validateResult = validateCreateEmail({
    subject,
    to_email,
    template_id,
    variables,
  })
  if (!validateResult.success)
    throw new CustomError(JSON.stringify(validateResult.error.flatten()), 400)

  const template = await Template.findOne({
    _id: template_id,
    deleted_at: null,
  })
  if (!template) throw new CustomError('Template not found', 404)

  const { raw_html } = template
  const htmlComponentsReplaced = await replaceComponentsInHtml(raw_html)
  const finalHtml = replaceVariablesInHtml(htmlComponentsReplaced, variables)

  await sendEmail(to_email, subject, finalHtml)

  const email = await Email.create({
    subject,
    to_email,
    template_id,
    final_body_html: finalHtml,
  })

  return email
}

export { create }
