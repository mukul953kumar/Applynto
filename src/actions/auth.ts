"use server"

import { registerSchema, RegisterInput } from "@/lib/validations/auth"
import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/lib/password"
import { Role } from "@prisma/client"

export type ActionResult<T = unknown> = {
  success: boolean
  error?: string
  data?: T
}

export async function registerUser(input: RegisterInput): Promise<ActionResult> {
  const parsed = registerSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid input",
    }
  }

  const normalizedEmail = parsed.data.email.toLowerCase().trim()

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  })

  if (existingUser) {
    return {
      success: false,
      error: "An account with this email address already exists",
    }
  }

  const passwordHash = await hashPassword(parsed.data.password)

  await prisma.user.create({
    data: {
      name: parsed.data.name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: Role.STUDENT,
    },
  })

  return { success: true }
}
