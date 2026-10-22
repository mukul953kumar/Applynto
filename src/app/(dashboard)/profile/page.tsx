import { Metadata } from "next"
import { notFound } from "next/navigation"
import { requireAuth } from "@/lib/session"
import { getProfile, getResumeVersionStats } from "@/actions/profile"
import { ProfileForm } from "@/components/profile/profile-form"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Student Profile & Match Preferences | Applynto",
  description: "Set up your academic details, skills, target roles, and work mode preferences.",
}

export default async function ProfilePage() {
  await requireAuth()
  const [profile, resumeStats] = await Promise.all([
    getProfile(),
    getResumeVersionStats(),
  ])

  if (!profile) {
    notFound()
  }

  return (
    <div className="container max-w-4xl mx-auto py-6 px-4 md:px-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Student Profile & Matching Preferences
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Your profile is evaluated by our deterministic matching engine to provide precision suitability scores for all live opportunities.
        </p>
      </div>

      <ProfileForm initialData={profile} resumeStats={resumeStats} />
    </div>
  )
}
