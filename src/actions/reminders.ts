"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/session"
import {
  createReminderSchema,
  updateReminderSchema,
  CreateReminderInput,
  UpdateReminderInput,
} from "@/lib/validations/reminder"
import { ReminderStatus, Priority, Prisma } from "@prisma/client"
import { ActionResult } from "@/actions/auth"

export async function createReminder(
  input: CreateReminderInput
): Promise<ActionResult<{ id: string }>> {
  const user = await requireAuth()

  const parsed = createReminderSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid reminder data",
    }
  }

  const data = parsed.data

  if (data.applicationId) {
    const app = await prisma.application.findFirst({
      where: {
        id: data.applicationId,
        userId: user.id,
      },
    })

    if (!app) {
      return {
        success: false,
        error: "Linked application not found or unauthorized",
      }
    }
  }

  const dueDate = new Date(data.dueAt)
  if (isNaN(dueDate.getTime())) {
    return {
      success: false,
      error: "Invalid due date",
    }
  }

  const reminder = await prisma.reminder.create({
    data: {
      userId: user.id,
      applicationId: data.applicationId || null,
      interviewId: data.interviewId || null,
      title: data.title.trim(),
      description: data.description?.trim() || null,
      type: data.type,
      dueAt: dueDate,
      timeZone: data.timeZone || "Asia/Kolkata",
      priority: data.priority,
      status: ReminderStatus.PENDING,
    },
  })

  revalidatePath("/reminders")
  revalidatePath("/dashboard")
  if (data.applicationId) {
    revalidatePath(`/applications/${data.applicationId}`)
  }
  return { success: true, data: { id: reminder.id } }
}

export async function toggleReminderStatus(id: string): Promise<ActionResult> {
  const user = await requireAuth()

  const existing = await prisma.reminder.findFirst({
    where: {
      id,
      userId: user.id,
    },
  })

  if (!existing) {
    return {
      success: false,
      error: "Reminder not found or unauthorized",
    }
  }

  const nextStatus =
    existing.status === ReminderStatus.COMPLETED
      ? ReminderStatus.PENDING
      : ReminderStatus.COMPLETED

  await prisma.reminder.update({
    where: { id },
    data: {
      status: nextStatus,
      completedAt: nextStatus === ReminderStatus.COMPLETED ? new Date() : null,
    },
  })

  revalidatePath("/reminders")
  revalidatePath("/dashboard")
  if (existing.applicationId) {
    revalidatePath(`/applications/${existing.applicationId}`)
  }
  return { success: true }
}

export async function snoozeReminder(id: string, hours: number = 24): Promise<ActionResult> {
  const user = await requireAuth()

  const existing = await prisma.reminder.findFirst({
    where: {
      id,
      userId: user.id,
    },
  })

  if (!existing) {
    return {
      success: false,
      error: "Reminder not found or unauthorized",
    }
  }

  const newDue = new Date(existing.dueAt.getTime() + hours * 60 * 60 * 1000)

  await prisma.reminder.update({
    where: { id },
    data: {
      dueAt: newDue,
      status: ReminderStatus.SNOOZED,
    },
  })

  revalidatePath("/reminders")
  revalidatePath("/dashboard")
  return { success: true }
}

export async function updateReminder(input: UpdateReminderInput): Promise<ActionResult> {
  const user = await requireAuth()

  const parsed = updateReminderSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid reminder data",
    }
  }

  const { id, ...data } = parsed.data

  const existing = await prisma.reminder.findFirst({
    where: {
      id,
      userId: user.id,
    },
  })

  if (!existing) {
    return {
      success: false,
      error: "Reminder not found or unauthorized",
    }
  }

  const dueDate = data.dueAt ? new Date(data.dueAt) : undefined

  await prisma.reminder.update({
    where: { id },
    data: {
      title: data.title ? data.title.trim() : undefined,
      description: data.description !== undefined ? (data.description?.trim() || null) : undefined,
      type: data.type,
      dueAt: dueDate,
      priority: data.priority,
      status: data.status,
      completedAt: data.status === ReminderStatus.COMPLETED ? new Date() : data.status ? null : undefined,
    },
  })

  revalidatePath("/reminders")
  revalidatePath("/dashboard")
  if (existing.applicationId) {
    revalidatePath(`/applications/${existing.applicationId}`)
  }
  return { success: true }
}

export async function deleteReminder(id: string): Promise<ActionResult> {
  const user = await requireAuth()

  const existing = await prisma.reminder.findFirst({
    where: {
      id,
      userId: user.id,
    },
  })

  if (!existing) {
    return {
      success: false,
      error: "Reminder not found or unauthorized",
    }
  }

  await prisma.reminder.delete({
    where: { id },
  })

  revalidatePath("/reminders")
  revalidatePath("/dashboard")
  if (existing.applicationId) {
    revalidatePath(`/applications/${existing.applicationId}`)
  }
  return { success: true }
}

export async function getUserReminders(filters?: {
  status?: ReminderStatus
  priority?: Priority
  applicationId?: string
}) {
  const user = await requireAuth()

  const where: Prisma.ReminderWhereInput = {
    userId: user.id,
  }

  if (filters?.status) {
    where.status = filters.status
  }

  if (filters?.priority) {
    where.priority = filters.priority
  }

  if (filters?.applicationId) {
    where.applicationId = filters.applicationId
  }

  return prisma.reminder.findMany({
    where,
    orderBy: [{ status: "asc" }, { dueAt: "asc" }],
    include: {
      application: {
        select: {
          id: true,
          companyName: true,
          roleTitle: true,
        },
      },
    },
  })
}
