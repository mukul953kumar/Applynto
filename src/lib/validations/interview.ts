import { z } from "zod"
import { InterviewType, InterviewStatus, InterviewResult } from "@prisma/client"

export const createInterviewSchema = z.object({
  applicationId: z.string().min(1, "Please select an application"),
  type: z.nativeEnum(InterviewType).default(InterviewType.TECHNICAL_INTERVIEW),
  roundName: z.string().max(100).optional().or(z.literal("")),
  scheduledAt: z.string().min(1, "Scheduled date and time is required"),
  timeZone: z.string().default("Asia/Kolkata"),
  durationMinutes: z.coerce.number().int().positive().optional().or(z.literal(0)),
  meetingUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  interviewerName: z.string().max(100).optional().or(z.literal("")),
  preparationNotes: z.string().max(3000).optional().or(z.literal("")),
  feedback: z.string().max(3000).optional().or(z.literal("")),
  status: z.nativeEnum(InterviewStatus).default(InterviewStatus.SCHEDULED),
  result: z.nativeEnum(InterviewResult).default(InterviewResult.PENDING),
})

export const updateInterviewSchema = createInterviewSchema.partial().extend({
  id: z.string().min(1),
})

export type CreateInterviewInput = z.input<typeof createInterviewSchema>
export type UpdateInterviewInput = z.input<typeof updateInterviewSchema>
