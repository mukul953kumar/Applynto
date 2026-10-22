"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/session"
import { createNoteSchema, updateNoteSchema, CreateNoteInput, UpdateNoteInput } from "@/lib/validations/note"
import { NoteCategory, Prisma } from "@prisma/client"
import { ActionResult } from "@/actions/auth"

export async function createNote(input: CreateNoteInput): Promise<ActionResult<{ id: string }>> {
  const user = await requireAuth()

  const parsed = createNoteSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid note data",
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

  const note = await prisma.note.create({
    data: {
      userId: user.id,
      title: data.title.trim(),
      content: data.content.trim(),
      category: data.category,
      tags: data.tags || [],
      applicationId: data.applicationId || null,
      interviewId: data.interviewId || null,
    },
  })

  revalidatePath("/notes")
  if (data.applicationId) {
    revalidatePath(`/applications/${data.applicationId}`)
  }
  return { success: true, data: { id: note.id } }
}

export async function updateNote(input: UpdateNoteInput): Promise<ActionResult> {
  const user = await requireAuth()

  const parsed = updateNoteSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid note data",
    }
  }

  const { id, ...data } = parsed.data

  const existing = await prisma.note.findFirst({
    where: {
      id,
      userId: user.id,
    },
  })

  if (!existing) {
    return {
      success: false,
      error: "Note not found or unauthorized",
    }
  }

  await prisma.note.update({
    where: { id },
    data: {
      title: data.title ? data.title.trim() : undefined,
      content: data.content !== undefined ? data.content.trim() : undefined,
      category: data.category,
      tags: data.tags !== undefined ? data.tags : undefined,
      applicationId: data.applicationId !== undefined ? (data.applicationId || null) : undefined,
    },
  })

  revalidatePath("/notes")
  if (existing.applicationId) {
    revalidatePath(`/applications/${existing.applicationId}`)
  }
  return { success: true }
}

export async function deleteNote(id: string): Promise<ActionResult> {
  const user = await requireAuth()

  const existing = await prisma.note.findFirst({
    where: {
      id,
      userId: user.id,
    },
  })

  if (!existing) {
    return {
      success: false,
      error: "Note not found or unauthorized",
    }
  }

  await prisma.note.delete({
    where: { id },
  })

  revalidatePath("/notes")
  if (existing.applicationId) {
    revalidatePath(`/applications/${existing.applicationId}`)
  }
  return { success: true }
}

export async function getUserNotes(filters?: {
  category?: NoteCategory
  applicationId?: string
  search?: string
}) {
  const user = await requireAuth()

  const where: Prisma.NoteWhereInput = {
    userId: user.id,
  }

  if (filters?.category) {
    where.category = filters.category
  }

  if (filters?.applicationId) {
    where.applicationId = filters.applicationId
  }

  if (filters?.search && filters.search.trim().length > 0) {
    const q = filters.search.trim()
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { content: { contains: q, mode: "insensitive" } },
      { tags: { has: q } },
    ]
  }

  return prisma.note.findMany({
    where,
    orderBy: { updatedAt: "desc" },
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
