import { z } from 'zod'

const createEmailSchema = z.object({
  subject: z.string({
    required_error: 'Subject is required',
    invalid_type_error: 'Subject must be a string',
  }),
  to_email: z.string().email({
    required_error: 'To email is required',
    invalid_type_error: 'To email must be a valid email',
  }),
  template_id: z.string({
    required_error: 'Template ID is required',
    invalid_type_error: 'Template ID must be a string',
  }),
  variables: z.array(
    z.object({
      name: z.string(),
      value: z.string(),
    })
  ),
})

function validateCreateEmail(object) {
  return createEmailSchema.safeParse(object)
}

export { validateCreateEmail }
