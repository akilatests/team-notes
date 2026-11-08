import { z } from 'zod'
import { INPUT_LIMITS } from '../limits.ts'

export const nameSchema = z.object({
  name: z.string().trim().min(1, 'Enter your name to continue.').max(INPUT_LIMITS.userName),
})
