import { z } from "zod"
import { ReminderType, Priority, ReminderStatus } from "@prisma/client"

export const createReminderSchema = z.object({
  applicationId: z.string().optional().or(z.literal("")),
  interviewId: z.string().optional().or(z.literal("")),
  title: z.string().min(2, "Reminder title must be at least 2 characters").max(200),
  description: z.string().max(1000).optional().or(z.literal("")),
  type: z.nativeEnum(ReminderType).default(ReminderType.CUSTOM),
  dueAt: z.string().min(1, "Due date and time is required"),
  timeZone: z.string().default("Asia/Kolkata"),
  priority: z.nativeEnum(Priority).default(Priority.MEDIUM),
})

export const updateReminderSchema = createReminderSchema.partial().extend({
  id: z.string().min(1),
  status: z.nativeEnum(ReminderStatus).optional(),
})

export type CreateReminderInput = z.input<typeof createReminderSchema>
export type UpdateReminderInput = z.input<typeof updateReminderSchema>
