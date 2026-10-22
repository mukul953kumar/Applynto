import { z } from "zod"
import { NoteCategory } from "@prisma/client"

export const createNoteSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(200),
  content: z.string().min(1, "Note content cannot be empty").max(10000),
  category: z.nativeEnum(NoteCategory).default(NoteCategory.GENERAL),
  tags: z.array(z.string().min(1).max(50)).default([]),
  applicationId: z.string().optional().or(z.literal("")),
  interviewId: z.string().optional().or(z.literal("")),
})

export const updateNoteSchema = createNoteSchema.partial().extend({
  id: z.string().min(1),
})

export type CreateNoteInput = z.input<typeof createNoteSchema>
export type UpdateNoteInput = z.input<typeof updateNoteSchema>
