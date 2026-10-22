import { z } from "zod"
import { ListingStatus, SourceType, VerificationStatus, WorkMode } from "@prisma/client"

export const internshipFilterSchema = z.object({
  q: z.string().optional(),
  workMode: z.nativeEnum(WorkMode).optional(),
  degree: z.string().optional(),
  minStipend: z.coerce.number().optional(),
  verifiedOnly: z.coerce.boolean().optional(),
  sort: z.enum(["newest", "deadline", "stipend"]).default("newest"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(12),
})

export const createInternshipSchema = z.object({
  title: z.string().min(2, "Title is required").max(150),
  companyName: z.string().min(2, "Company name is required").max(100),
  companyWebsite: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  companyLogoUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  shortDescription: z.string().min(10, "Short description is required").max(300),
  description: z.string().min(20, "Detailed description is required"),
  responsibilities: z.string().optional(),
  requiredSkills: z.array(z.string()).min(1, "At least one skill is required"),
  preferredSkills: z.array(z.string()).default([]),
  eligibleDegrees: z.array(z.string()).default([]),
  eligibleBranches: z.array(z.string()).default([]),
  eligibleGraduationYears: z.array(z.number().int()).default([]),
  location: z.string().optional(),
  workMode: z.nativeEnum(WorkMode).default(WorkMode.NOT_SPECIFIED),
  stipendMin: z.coerce.number().int().nonnegative().optional(),
  stipendMax: z.coerce.number().int().nonnegative().optional(),
  currency: z.string().default("INR"),
  duration: z.string().optional(),
  deadline: z.string().optional(),
  officialApplyUrl: z.string().url("Must be a valid HTTPS URL").regex(/^https:\/\//i, "URL must use HTTPS protocol"),
  sourceUrl: z.string().url().optional().or(z.literal("")),
  sourceType: z.nativeEnum(SourceType).default(SourceType.ADMIN_FORM),
  verificationStatus: z.nativeEnum(VerificationStatus).default(VerificationStatus.VERIFIED),
  status: z.nativeEnum(ListingStatus).default(ListingStatus.PUBLISHED),
})

export const reportListingSchema = z.object({
  internshipId: z.string().min(1),
  reason: z.enum([
    "BROKEN_LINK",
    "EXPIRED",
    "INCORRECT_INFO",
    "SUSPICIOUS_OR_FRAUD",
    "DUPLICATE",
    "MISLEADING_ELIGIBILITY",
    "OTHER",
  ]),
  description: z.string().max(1000).optional(),
})

export type InternshipFilterInput = z.infer<typeof internshipFilterSchema>
export type CreateInternshipInput = z.infer<typeof createInternshipSchema>
export type ReportListingInput = z.infer<typeof reportListingSchema>
