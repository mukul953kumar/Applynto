import { z } from "zod"
import { WorkMode } from "@prisma/client"

export const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100).optional(),
  college: z.string().max(150).optional().or(z.literal("")),
  degree: z.string().max(100).optional().or(z.literal("")),
  branch: z.string().max(100).optional().or(z.literal("")),
  graduationYear: z.coerce.number().int().min(2020).max(2032).optional().or(z.literal(0)),
  skills: z.array(z.string().min(1).max(50)).default([]),
  preferredRoles: z.array(z.string().min(1).max(50)).default([]),
  preferredWorkModes: z.array(z.nativeEnum(WorkMode)).default([]),
  preferredLocations: z.array(z.string().min(1).max(50)).default([]),
  minimumStipend: z.coerce.number().int().min(0).max(500000).optional().or(z.literal(0)),
})

export type UpdateProfileInput = z.input<typeof updateProfileSchema>
export type UpdateProfileParsed = z.infer<typeof updateProfileSchema>
