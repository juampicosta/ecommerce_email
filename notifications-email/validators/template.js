import { z } from 'zod'

const createTemplateSchema = z.object({
  name: z.string({
    required_error: 'Name is required',
    invalid_type_error: 'Name must be a string',
  }),
  raw_html: z.string({
    required_error: 'Raw HTML is required',
    invalid_type_error: 'Raw HTML must be a string',
  }),
})

function validateCreateTemplate(object) {
  return createTemplateSchema.safeParse(object)
}

export { validateCreateTemplate }
