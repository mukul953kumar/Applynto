"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/session"
import {
  createInterviewSchema,
  updateInterviewSchema,
  CreateInterviewInput,
  UpdateInterviewInput,
} from "@/lib/validations/interview"
import { ApplicationStatus, InterviewType, InterviewStatus, InterviewResult, Prisma } from "@prisma/client"
import { ActionResult } from "@/actions/auth"

export async function createInterview(
  input: CreateInterviewInput
): Promise<ActionResult<{ id: string }>> {
  const user = await requireAuth()

  const parsed = createInterviewSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid interview data",
    }
  }

  const data = parsed.data

  const application = await prisma.application.findFirst({
    where: {
      id: data.applicationId,
      userId: user.id,
    },
  })

  if (!application) {
    return {
      success: false,
      error: "Linked application not found or unauthorized",
    }
  }

  const scheduledDate = new Date(data.scheduledAt)
  if (isNaN(scheduledDate.getTime())) {
    return {
      success: false,
      error: "Invalid scheduled date and time",
    }
  }

  const isAssessment =
    data.type === InterviewType.ONLINE_ASSESSMENT ||
    data.type === InterviewType.CODING_ROUND ||
    data.type === InterviewType.TAKE_HOME_ASSIGNMENT

  const targetStatus = isAssessment ? ApplicationStatus.ASSESSMENT : ApplicationStatus.INTERVIEW

  const shouldAdvanceStatus =
    application.status === ApplicationStatus.SAVED ||
    application.status === ApplicationStatus.APPLIED ||
    (application.status === ApplicationStatus.ASSESSMENT && !isAssessment)

  const interview = await prisma.$transaction(async (tx) => {
    const createdInterview = await tx.interview.create({
      data: {
        userId: user.id,
        applicationId: data.applicationId,
        type: data.type,
        roundName: data.roundName?.trim() || null,
        scheduledAt: scheduledDate,
        timeZone: data.timeZone || "Asia/Kolkata",
        durationMinutes: data.durationMinutes ? Number(data.durationMinutes) : null,
        meetingUrl: data.meetingUrl || null,
        interviewerName: data.interviewerName?.trim() || null,
        preparationNotes: data.preparationNotes?.trim() || null,
        feedback: data.feedback?.trim() || null,
        status: data.status,
        result: data.result,
      },
    })

    if (shouldAdvanceStatus) {
      await tx.application.update({
        where: { id: application.id },
        data: {
          status: targetStatus,
          nextAction: `Attend ${data.roundName || data.type.replace(/_/g, " ")}`,
          nextActionAt: scheduledDate,
        },
      })

      await tx.applicationStatusHistory.create({
        data: {
          applicationId: application.id,
          previousStatus: application.status,
          newStatus: targetStatus,
          changedById: user.id,
          note: `Advanced automatically after scheduling ${data.roundName || data.type.replace(/_/g, " ")}`,
        },
      })
    }

    await tx.reminder.create({
      data: {
        userId: user.id,
        applicationId: application.id,
        interviewId: createdInterview.id,
        title: `Prepare for ${data.roundName || data.type.replace(/_/g, " ")} (${application.companyName})`,
        description: data.meetingUrl ? `Meeting URL: ${data.meetingUrl}` : undefined,
        type: isAssessment ? "ASSESSMENT_DEADLINE" : "INTERVIEW_DATE",
        dueAt: scheduledDate,
        priority: "HIGH",
        status: "PENDING",
      },
    })

    return createdInterview
  })

  revalidatePath("/interviews")
  revalidatePath("/reminders")
  revalidatePath("/applications")
  revalidatePath(`/applications/${data.applicationId}`)
  revalidatePath("/dashboard")
  return { success: true, data: { id: interview.id } }
}

export async function updateInterview(
  input: UpdateInterviewInput
): Promise<ActionResult> {
  const user = await requireAuth()

  const parsed = updateInterviewSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid interview data",
    }
  }

  const { id, ...data } = parsed.data

  const existing = await prisma.interview.findFirst({
    where: {
      id,
      userId: user.id,
    },
    include: {
      application: true,
    },
  })

  if (!existing) {
    return {
      success: false,
      error: "Interview not found or unauthorized",
    }
  }

  const scheduledDate = data.scheduledAt ? new Date(data.scheduledAt) : undefined

  await prisma.$transaction(async (tx) => {
    await tx.interview.update({
      where: { id },
      data: {
        type: data.type,
        roundName: data.roundName !== undefined ? (data.roundName?.trim() || null) : undefined,
        scheduledAt: scheduledDate,
        timeZone: data.timeZone,
        durationMinutes: data.durationMinutes !== undefined ? (data.durationMinutes ? Number(data.durationMinutes) : null) : undefined,
        meetingUrl: data.meetingUrl !== undefined ? (data.meetingUrl || null) : undefined,
        interviewerName: data.interviewerName !== undefined ? (data.interviewerName?.trim() || null) : undefined,
        preparationNotes: data.preparationNotes !== undefined ? (data.preparationNotes?.trim() || null) : undefined,
        feedback: data.feedback !== undefined ? (data.feedback?.trim() || null) : undefined,
        status: data.status,
        result: data.result,
      },
    })

    if (data.result === InterviewResult.REJECTED && existing.application.status !== ApplicationStatus.REJECTED) {
      await tx.application.update({
        where: { id: existing.applicationId },
        data: { status: ApplicationStatus.REJECTED },
      })

      await tx.applicationStatusHistory.create({
        data: {
          applicationId: existing.applicationId,
          previousStatus: existing.application.status,
          newStatus: ApplicationStatus.REJECTED,
          changedById: user.id,
          note: `Application marked rejected after ${existing.roundName || existing.type.replace(/_/g, " ")} round outcome`,
        },
      })
    }
  })

  revalidatePath("/interviews")
  revalidatePath("/applications")
  revalidatePath(`/applications/${existing.applicationId}`)
  revalidatePath("/dashboard")
  return { success: true }
}

export async function deleteInterview(id: string): Promise<ActionResult> {
  const user = await requireAuth()

  const existing = await prisma.interview.findFirst({
    where: {
      id,
      userId: user.id,
    },
  })

  if (!existing) {
    return {
      success: false,
      error: "Interview not found or unauthorized",
    }
  }

  await prisma.interview.delete({
    where: { id },
  })

  revalidatePath("/interviews")
  revalidatePath("/reminders")
  revalidatePath("/applications")
  revalidatePath(`/applications/${existing.applicationId}`)
  revalidatePath("/dashboard")
  return { success: true }
}

export async function getUserInterviews(filters?: {
  status?: InterviewStatus
  type?: InterviewType
  result?: InterviewResult
  upcomingOnly?: boolean
}) {
  const user = await requireAuth()

  const where: Prisma.InterviewWhereInput = {
    userId: user.id,
  }

  if (filters?.status) {
    where.status = filters.status
  }

  if (filters?.type) {
    where.type = filters.type
  }

  if (filters?.result) {
    where.result = filters.result
  }

  if (filters?.upcomingOnly) {
    where.scheduledAt = { gte: new Date() }
    where.status = InterviewStatus.SCHEDULED
  }

  return prisma.interview.findMany({
    where,
    orderBy: { scheduledAt: filters?.upcomingOnly ? "asc" : "desc" },
    include: {
      application: {
        select: {
          id: true,
          companyName: true,
          roleTitle: true,
          status: true,
          jobUrl: true,
        },
      },
    },
  })
}

export async function getInterviewDetails(id: string) {
  const user = await requireAuth()

  return prisma.interview.findFirst({
    where: {
      id,
      userId: user.id,
    },
    include: {
      application: true,
      reminders: {
        orderBy: { dueAt: "asc" },
      },
    },
  })
}
