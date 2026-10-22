import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Role } from "@prisma/client"

export async function getCurrentUser() {
  const session = await auth()
  return session?.user ?? null
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user || !user.id) {
    redirect("/login")
  }
  return user
}

export async function requireAdmin() {
  const user = await requireAuth()
  if (user.role !== Role.ADMIN) {
    redirect("/dashboard")
  }
  return user
}
