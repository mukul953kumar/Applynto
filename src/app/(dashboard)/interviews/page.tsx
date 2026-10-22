import { Metadata } from "next"
import { requireAuth } from "@/lib/session"
import { getUserInterviews } from "@/actions/interviews"
import { prisma } from "@/lib/prisma"
import { InterviewsView } from "@/components/interviews/interviews-view"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Interviews & Assessments | Applynto",
  description: "Track coding assessments, technical interviews, preparation notes, and outcomes.",
}

interface InterviewsPageProps {
  searchParams: Promise<{ applicationId?: string }>
}

export default async function InterviewsPage({ searchParams }: InterviewsPageProps) {
  const user = await requireAuth()
  const { applicationId } = await searchParams

  const [interviews, applications] = await Promise.all([
    getUserInterviews(),
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
      <InterviewsView
        initialInterviews={interviews}
        applications={applications}
        preselectedApplicationId={applicationId}
      />
    </div>
  )
}
