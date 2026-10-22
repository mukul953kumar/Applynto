import { Metadata } from "next"
import { requireAuth } from "@/lib/session"
import { getUserApplications } from "@/actions/applications"
import { ApplicationsView } from "@/components/applications/applications-view"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Application Tracker | Applynto",
  description: "Track and organize your internship applications across all 8 pipeline stages.",
}

export default async function ApplicationsPage() {
  await requireAuth()
  const applications = await getUserApplications()

  return (
    <div className="container max-w-7xl mx-auto py-6 px-4 md:px-6">
      <ApplicationsView initialApplications={applications} />
    </div>
  )
}
