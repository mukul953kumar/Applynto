import { z } from "zod"
import { ApplicationStatus } from "@prisma/client"

export const createApplicationSchema = z.object({
  internshipId: z.string().optional(),
  companyName: z.string().min(2, "Company name must be at least 2 characters").max(100),
  roleTitle: z.string().min(2, "Role title must be at least 2 characters").max(100),
  jobUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  source: z.string().max(100).optional().or(z.literal("")),
  status: z.nativeEnum(ApplicationStatus).default(ApplicationStatus.APPLIED),
  appliedAt: z.string().optional(),
  resumeVersion: z.string().max(100).optional().or(z.literal("")),
  recruiterName: z.string().max(100).optional().or(z.literal("")),
  recruiterContact: z.string().max(100).optional().or(z.literal("")),
  nextAction: z.string().max(200).optional().or(z.literal("")),
  nextActionAt: z.string().optional(),
  notes: z.string().max(3000).optional().or(z.literal("")),
})

export const updateApplicationStageSchema = z.object({
  applicationId: z.string().min(1),
  newStatus: z.nativeEnum(ApplicationStatus),
  note: z.string().max(500).optional().or(z.literal("")),
})

export const updateApplicationSchema = createApplicationSchema.partial().extend({
  id: z.string().min(1),
})

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>
export type UpdateApplicationStageInput = z.infer<typeof updateApplicationStageSchema>
export type UpdateApplicationInput = z.infer<typeof updateApplicationSchema>
