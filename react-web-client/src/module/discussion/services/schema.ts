import { z } from 'zod'

export const discussionSchema = z.object({
    subject: z.string(),
    description: z.string()
})

export type discussionType = z.infer<typeof discussionSchema>