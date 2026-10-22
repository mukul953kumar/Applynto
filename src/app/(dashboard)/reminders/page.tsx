import { Metadata } from "next"
import { requireAuth } from "@/lib/session"
import { getUserReminders } from "@/actions/reminders"
import { prisma } from "@/lib/prisma"
import { RemindersView } from "@/components/reminders/reminders-view"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Reminders & Action Items | Applynto",
  description: "Stay ahead of assignment deadlines, recruiter follow-ups, and interview slots.",
}

interface RemindersPageProps {
  searchParams: Promise<{ applicationId?: string }>
}

export default async function RemindersPage({ searchParams }: RemindersPageProps) {
  const user = await requireAuth()
  const { applicationId } = await searchParams

  const [reminders, applications] = await Promise.all([
    getUserReminders(),
    prisma.application.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        companyName: true,
        roleTitle: true,
      },
      orderBy: { updatedAt: "desc" },
    }),
  ])

  return (
    <div className="container max-w-5xl mx-auto py-6 px-4 md:px-6">
      <RemindersView
        initialReminders={reminders}
        applications={applications}
        preselectedApplicationId={applicationId}
      />
    </div>
  )
}
