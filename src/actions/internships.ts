"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { getCurrentUser, requireAuth } from "@/lib/session"
import {
  internshipFilterSchema,
  reportListingSchema,
  InternshipFilterInput,
  ReportListingInput,
} from "@/lib/validations/internship"
import { ListingStatus, Prisma, VerificationStatus } from "@prisma/client"
import { ActionResult } from "@/actions/auth"

export type InternshipListItem = {
  id: string
  title: string
  companyName: string
  companyLogoUrl: string | null
  shortDescription: string
  location: string | null
  workMode: string
  stipendMin: number | null
  stipendMax: number | null
  currency: string
  deadline: Date | null
  requiredSkills: string[]
  verificationStatus: string
  createdAt: Date
  isSaved?: boolean
  isExpired?: boolean
}

export type PaginatedInternshipsResult = {
  items: InternshipListItem[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export async function getPublicInternships(
  rawFilters: Partial<InternshipFilterInput>
): Promise<PaginatedInternshipsResult> {
  const parsed = internshipFilterSchema.safeParse(rawFilters)
  const filters = parsed.success ? parsed.data : internshipFilterSchema.parse({})

  const user = await getCurrentUser()

  const now = new Date()

  const where: Prisma.InternshipWhereInput = {
    status: ListingStatus.PUBLISHED,
  }

  if (filters.q && filters.q.trim().length > 0) {
    const query = filters.q.trim()
    where.OR = [
      { title: { contains: query, mode: "insensitive" } },
      { companyName: { contains: query, mode: "insensitive" } },
      { shortDescription: { contains: query, mode: "insensitive" } },
      { requiredSkills: { hasSome: [query] } },
    ]
  }

  if (filters.workMode) {
    where.workMode = filters.workMode
  }

  if (filters.verifiedOnly) {
    where.verificationStatus = VerificationStatus.VERIFIED
  }

  if (filters.minStipend !== undefined && filters.minStipend > 0) {
    where.OR = [
      { stipendMin: { gte: filters.minStipend } },
      { stipendMax: { gte: filters.minStipend } },
    ]
  }

  if (filters.degree && filters.degree.trim().length > 0) {
    where.eligibleDegrees = {
      has: filters.degree.trim(),
    }
  }

  let orderBy: Prisma.InternshipOrderByWithRelationInput = { createdAt: "desc" }
  if (filters.sort === "deadline") {
    orderBy = { deadline: "asc" }
  } else if (filters.sort === "stipend") {
    orderBy = { stipendMax: "desc" }
  }

  const skip = (filters.page - 1) * filters.pageSize
  const take = filters.pageSize

  const [total, internships, savedIds] = await Promise.all([
    prisma.internship.count({ where }),
    prisma.internship.findMany({
      where,
      orderBy,
      skip,
      take,
      select: {
        id: true,
        title: true,
        companyName: true,
        companyLogoUrl: true,
        shortDescription: true,
        location: true,
        workMode: true,
        stipendMin: true,
        stipendMax: true,
        currency: true,
        deadline: true,
        requiredSkills: true,
        verificationStatus: true,
        createdAt: true,
      },
    }),
    user
      ? prisma.savedInternship
          .findMany({
            where: { userId: user.id },
            select: { internshipId: true },
          })
          .then((rows) => new Set(rows.map((r) => r.internshipId)))
      : Promise.resolve(new Set<string>()),
  ])

  const items: InternshipListItem[] = internships.map((item) => ({
    ...item,
    isSaved: savedIds.has(item.id),
    isExpired: item.deadline ? item.deadline < now : false,
  }))

  const totalPages = Math.ceil(total / filters.pageSize) || 1

  return {
    items,
    total,
    page: filters.page,
    pageSize: filters.pageSize,
    totalPages,
  }
}

export async function toggleSaveInternship(internshipId: string): Promise<ActionResult<{ saved: boolean }>> {
  const user = await requireAuth()

  const existing = await prisma.savedInternship.findUnique({
    where: {
      userId_internshipId: {
        userId: user.id,
        internshipId,
      },
    },
  })

  if (existing) {
    await prisma.savedInternship.delete({
      where: { id: existing.id },
    })
    revalidatePath("/internships")
    revalidatePath("/saved")
    revalidatePath("/dashboard")
    return { success: true, data: { saved: false } }
  }

  const internship = await prisma.internship.findUnique({
    where: { id: internshipId },
    select: { id: true },
  })

  if (!internship) {
    return { success: false, error: "Internship opportunity not found" }
  }

  await prisma.savedInternship.create({
    data: {
      userId: user.id,
      internshipId,
    },
  })

  revalidatePath("/internships")
  revalidatePath("/saved")
  revalidatePath("/dashboard")
  return { success: true, data: { saved: true } }
}

export async function reportInternship(input: ReportListingInput): Promise<ActionResult> {
  const user = await requireAuth()

  const parsed = reportListingSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid report data" }
  }

  const internship = await prisma.internship.findUnique({
    where: { id: parsed.data.internshipId },
  })

  if (!internship) {
    return { success: false, error: "Listing not found" }
  }

  await prisma.internshipReport.create({
    data: {
      userId: user.id,
      internshipId: parsed.data.internshipId,
      reason: parsed.data.reason,
      description: parsed.data.description?.trim(),
    },
  })

  return { success: true }
}

export async function getInternshipById(id: string) {
  const user = await getCurrentUser()
  const now = new Date()

  const internship = await prisma.internship.findUnique({
    where: { id },
  })

  if (!internship) {
    return null
  }

  let isSaved = false
  let existingApplicationId: string | null = null

  if (user) {
    const [savedRecord, applicationRecord] = await Promise.all([
      prisma.savedInternship.findUnique({
        where: {
          userId_internshipId: {
            userId: user.id,
            internshipId: id,
          },
        },
      }),
      prisma.application.findFirst({
        where: {
          userId: user.id,
          internshipId: id,
        },
        select: { id: true },
      }),
    ])
    isSaved = Boolean(savedRecord)
    existingApplicationId = applicationRecord?.id || null
  }

  return {
    ...internship,
    isSaved,
    existingApplicationId,
    isExpired: internship.deadline ? internship.deadline < now : false,
  }
}

