"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/session"
import { hashPassword, verifyPassword } from "@/lib/password"
import {
  updateAccountSchema,
  changePasswordSchema,
  deleteAccountSchema,
  UpdateAccountInput,
  ChangePasswordInput,
  DeleteAccountInput,
} from "@/lib/validations/settings"
import { ActionResult } from "@/actions/auth"

export async function updateAccountDetails(input: UpdateAccountInput): Promise<ActionResult> {
  const user = await requireAuth()

  const parsed = updateAccountSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid account data",
    }
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      name: parsed.data.name.trim(),
      image: parsed.data.image || null,
    },
  })

  revalidatePath("/settings")
  revalidatePath("/profile")
  revalidatePath("/dashboard")
  return { success: true }
}

export async function changePassword(input: ChangePasswordInput): Promise<ActionResult> {
  const user = await requireAuth()

  const parsed = changePasswordSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid password data",
    }
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
  })

  if (!dbUser || !dbUser.passwordHash) {
    return {
      success: false,
      error: "User account or password not found",
    }
  }

  const isValid = await verifyPassword(parsed.data.currentPassword, dbUser.passwordHash)
  if (!isValid) {
    return {
      success: false,
      error: "Current password is incorrect",
    }
  }

  const newHash = await hashPassword(parsed.data.newPassword)

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash: newHash,
    },
  })

  return { success: true }
}

export async function deleteAccount(input: DeleteAccountInput): Promise<ActionResult> {
  const user = await requireAuth()

  const parsed = deleteAccountSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: 'Please type "DELETE MY ACCOUNT" exactly to confirm deletion',
    }
  }

  await prisma.user.delete({
    where: { id: user.id },
  })

  return { success: true }
}
