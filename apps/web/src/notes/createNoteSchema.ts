import type { CreateNoteInput } from '@team-notes/types'
import { z } from 'zod'
import { INPUT_LIMITS } from '../limits.ts'

export const createNoteSchema = z.object({
  title: z.string().trim().min(1, 'Add a title to save this note.').max(INPUT_LIMITS.title),
  body: z.string().max(INPUT_LIMITS.body),
  tags: z
    .array(z.string())
    .max(INPUT_LIMITS.tagsMaxCount, `Use at most ${INPUT_LIMITS.tagsMaxCount} tags.`)
    .refine(
      (tags) => tags.every((tag) => tag.length <= INPUT_LIMITS.tagMaxLength),
      `Each tag can be at most ${INPUT_LIMITS.tagMaxLength} characters.`,
    ),
}) satisfies z.ZodType<CreateNoteInput>
