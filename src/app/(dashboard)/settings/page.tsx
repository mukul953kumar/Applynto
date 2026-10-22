import { Metadata } from "next"
import { notFound } from "next/navigation"
import { requireAuth } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { SettingsView } from "@/components/settings/settings-view"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Account Settings | Applynto",
  description: "Manage your account profile, security credentials, and preferences.",
}

export default async function SettingsPage() {
  const sessionUser = await requireAuth()

  const dbUser = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      createdAt: true,
    },
  })

  if (!dbUser) {
    notFound()
  }

  return (
    <div className="container max-w-4xl mx-auto py-6 px-4 md:px-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Account Settings & Security
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Manage your credentials, password, and account lifecycle.
        </p>
      </div>

      <SettingsView user={dbUser} />
    </div>
  )
}
