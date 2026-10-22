"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/session"
import {
  createApplicationSchema,
  updateApplicationStageSchema,
  updateApplicationSchema,
  CreateApplicationInput,
  UpdateApplicationStageInput,
  UpdateApplicationInput,
} from "@/lib/validations/application"
import { ApplicationStatus, Prisma } from "@prisma/client"
import { ActionResult } from "@/actions/auth"

export async function createApplication(
  input: CreateApplicationInput
): Promise<ActionResult<{ id: string }>> {
  const user = await requireAuth()

  const parsed = createApplicationSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid application data",
    }
  }

  const data = parsed.data

  if (data.internshipId) {
    const existing = await prisma.application.findFirst({
      where: {
        userId: user.id,
        internshipId: data.internshipId,
      },
    })

    if (existing) {
      return {
        success: false,
        error: "You are already tracking an application for this opportunity.",
      }
    }
  }

  const appliedAtDate = data.appliedAt ? new Date(data.appliedAt) : data.status !== ApplicationStatus.SAVED ? new Date() : null
  const nextActionDate = data.nextActionAt ? new Date(data.nextActionAt) : null

  const result = await prisma.$transaction(async (tx) => {
    const app = await tx.application.create({
      data: {
        userId: user.id,
        internshipId: data.internshipId || null,
        companyName: data.companyName.trim(),
        roleTitle: data.roleTitle.trim(),
        jobUrl: data.jobUrl || null,
        source: data.source || null,
        status: data.status,
        appliedAt: appliedAtDate,
        resumeVersion: data.resumeVersion?.trim() || null,
        recruiterName: data.recruiterName?.trim() || null,
        recruiterContact: data.recruiterContact?.trim() || null,
        nextAction: data.nextAction?.trim() || null,
        nextActionAt: nextActionDate,
        notes: data.notes?.trim() || null,
      },
    })

    await tx.applicationStatusHistory.create({
      data: {
        applicationId: app.id,
        newStatus: data.status,
        changedById: user.id,
        note: "Initial application entry created",
      },
    })

    return app
  })

  revalidatePath("/applications")
  revalidatePath("/dashboard")
  revalidatePath("/saved")
  return { success: true, data: { id: result.id } }
}

export async function updateApplicationStage(
  input: UpdateApplicationStageInput
): Promise<ActionResult> {
  const user = await requireAuth()

  const parsed = updateApplicationStageSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid status data",
    }
  }

  const { applicationId, newStatus, note } = parsed.data

  const existing = await prisma.application.findFirst({
    where: {
      id: applicationId,
      userId: user.id,
    },
  })

  if (!existing) {
    return { success: false, error: "Application not found or unauthorized" }
  }

  if (existing.status === newStatus) {
    return { success: true }
  }

  await prisma.$transaction(async (tx) => {
    await tx.application.update({
      where: { id: applicationId },
      data: {
        status: newStatus,
        appliedAt:
          existing.status === ApplicationStatus.SAVED && newStatus !== ApplicationStatus.SAVED && !existing.appliedAt
            ? new Date()
            : existing.appliedAt,
      },
    })

    await tx.applicationStatusHistory.create({
      data: {
        applicationId,
        previousStatus: existing.status,
        newStatus,
        changedById: user.id,
        note: note?.trim() || null,
      },
    })
  })

  revalidatePath("/applications")
  revalidatePath(`/applications/${applicationId}`)
  revalidatePath("/dashboard")
  return { success: true }
}

export async function getUserApplications(filters?: {
  status?: ApplicationStatus
  q?: string
}) {
  const user = await requireAuth()

  const where: Prisma.ApplicationWhereInput = {
    userId: user.id,
  }

  if (filters?.status) {
    where.status = filters.status
  }

  if (filters?.q && filters.q.trim().length > 0) {
    const query = filters.q.trim()
    where.OR = [
      { companyName: { contains: query, mode: "insensitive" } },
      { roleTitle: { contains: query, mode: "insensitive" } },
      { notes: { contains: query, mode: "insensitive" } },
    ]
  }

  return prisma.application.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    include: {
      history: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      _count: {
        select: {
          interviews: true,
          reminders: true,
        },
      },
    },
  })
}

export async function getApplicationDetails(id: string) {
  const user = await requireAuth()

  const app = await prisma.application.findFirst({
    where: {
      id,
      userId: user.id,
    },
    include: {
      internship: true,
      history: {
        orderBy: { createdAt: "desc" },
      },
      interviews: {
        orderBy: { scheduledAt: "asc" },
      },
      reminders: {
        orderBy: { dueAt: "asc" },
      },
    },
  })

  return app
}

export async function deleteApplication(id: string): Promise<ActionResult> {
  const user = await requireAuth()

  const existing = await prisma.application.findFirst({
    where: {
      id,
      userId: user.id,
    },
  })

  if (!existing) {
    return { success: false, error: "Application not found or unauthorized" }
  }

  await prisma.application.delete({
    where: { id },
  })

  revalidatePath("/applications")
  revalidatePath("/dashboard")
  revalidatePath("/saved")
  return { success: true }
}

export async function updateApplication(
  input: UpdateApplicationInput
): Promise<ActionResult> {
  const user = await requireAuth()

  const parsed = updateApplicationSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid application data",
    }
  }

  const { id, ...data } = parsed.data

  const existing = await prisma.application.findFirst({
    where: {
      id,
      userId: user.id,
    },
  })

  if (!existing) {
    return { success: false, error: "Application not found or unauthorized" }
  }

  const nextActionDate = data.nextActionAt ? new Date(data.nextActionAt) : null

  await prisma.application.update({
    where: { id },
    data: {
      companyName: data.companyName ? data.companyName.trim() : undefined,
      roleTitle: data.roleTitle ? data.roleTitle.trim() : undefined,
      jobUrl: data.jobUrl !== undefined ? (data.jobUrl || null) : undefined,
      source: data.source !== undefined ? (data.source || null) : undefined,
      resumeVersion: data.resumeVersion !== undefined ? (data.resumeVersion?.trim() || null) : undefined,
      recruiterName: data.recruiterName !== undefined ? (data.recruiterName?.trim() || null) : undefined,
      recruiterContact: data.recruiterContact !== undefined ? (data.recruiterContact?.trim() || null) : undefined,
      nextAction: data.nextAction !== undefined ? (data.nextAction?.trim() || null) : undefined,
      nextActionAt: data.nextActionAt !== undefined ? nextActionDate : undefined,
      notes: data.notes !== undefined ? (data.notes?.trim() || null) : undefined,
    },
  })

  revalidatePath("/applications")
  revalidatePath(`/applications/${id}`)
  revalidatePath("/dashboard")
  return { success: true }
}
