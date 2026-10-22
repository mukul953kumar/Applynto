"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/session"
import { updateProfileSchema, UpdateProfileInput } from "@/lib/validations/profile"
import { ApplicationStatus } from "@prisma/client"
import { ActionResult } from "@/actions/auth"

export async function getProfile() {
  const user = await requireAuth()

  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      college: true,
      degree: true,
      branch: true,
      graduationYear: true,
      skills: true,
      preferredRoles: true,
      preferredWorkModes: true,
      preferredLocations: true,
      minimumStipend: true,
      createdAt: true,
    },
  })

  return profile
}

export async function updateProfile(input: UpdateProfileInput): Promise<ActionResult> {
  const user = await requireAuth()

  const parsed = updateProfileSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid profile data",
    }
  }

  const data = parsed.data

  await prisma.user.update({
    where: { id: user.id },
    data: {
      name: data.name ? data.name.trim() : undefined,
      college: data.college !== undefined ? (data.college?.trim() || null) : undefined,
      degree: data.degree !== undefined ? (data.degree?.trim() || null) : undefined,
      branch: data.branch !== undefined ? (data.branch?.trim() || null) : undefined,
      graduationYear: data.graduationYear ? Number(data.graduationYear) : null,
      skills: data.skills || [],
      preferredRoles: data.preferredRoles || [],
      preferredWorkModes: data.preferredWorkModes || [],
      preferredLocations: data.preferredLocations || [],
      minimumStipend: data.minimumStipend ? Number(data.minimumStipend) : null,
    },
  })

  revalidatePath("/profile")
  revalidatePath("/dashboard")
  revalidatePath("/internships")
  return { success: true }
}

export async function getResumeVersionStats() {
  const user = await requireAuth()

  const applications = await prisma.application.findMany({
    where: {
      userId: user.id,
      resumeVersion: { not: null },
    },
    select: {
      resumeVersion: true,
      status: true,
    },
  })

  const statsMap: Record<
    string,
    { version: string; total: number; interviews: number; offers: number }
  > = {}

  for (const app of applications) {
    const v = app.resumeVersion!
    if (!statsMap[v]) {
      statsMap[v] = { version: v, total: 0, interviews: 0, offers: 0 }
    }
    statsMap[v].total += 1
    if (app.status === ApplicationStatus.INTERVIEW || app.status === ApplicationStatus.ASSESSMENT) {
      statsMap[v].interviews += 1
    }
    if (app.status === ApplicationStatus.OFFER) {
      statsMap[v].offers += 1
    }
  }

  return Object.values(statsMap).sort((a, b) => b.total - a.total)
}
