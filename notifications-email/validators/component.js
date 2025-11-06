import { z } from 'zod'

const createComponentSchema = z.object({
  name: z.string({
    required_error: 'Name is required',
    invalid_type_error: 'Name must be a string',
  }),
  html_content: z.string({
    required_error: 'HTML content is required',
    invalid_type_error: 'HTML content must be a string',
  }),
})

function validateCreateComponent(object) {
  return createComponentSchema.safeParse(object)
}

export { validateCreateComponent }
