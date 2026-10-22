import { Metadata } from "next"
import { requireAuth } from "@/lib/session"
import { getUserNotes } from "@/actions/notes"
import { prisma } from "@/lib/prisma"
import { NotesView } from "@/components/notes/notes-view"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Personal Notes & Workspace | Applynto",
  description: "Organize company research, interview questions, and assessment takeaways.",
}

interface NotesPageProps {
  searchParams: Promise<{ applicationId?: string }>
}

export default async function NotesPage({ searchParams }: NotesPageProps) {
  const user = await requireAuth()
  const { applicationId } = await searchParams

  const [notes, applications] = await Promise.all([
    getUserNotes(),
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
    <div className="container max-w-7xl mx-auto py-6 px-4 md:px-6">
      <NotesView
        initialNotes={notes}
        applications={applications}
        preselectedApplicationId={applicationId}
      />
    </div>
  )
}
