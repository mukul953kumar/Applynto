import { Metadata } from "next"
import { requireAuth } from "@/lib/session"
import { OnboardingWizard } from "@/components/profile/onboarding-wizard"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Welcome to Applynto | Student Onboarding",
  description: "Set up your student profile in 2 minutes to unlock personalized match scores.",
}

export default async function OnboardingPage() {
  await requireAuth()

  return (
    <div className="container max-w-4xl mx-auto py-10 px-4">
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          Welcome to Applynto!
        </h1>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Let&apos;s quickly tailor your student profile to find and match the best opportunities for your graduation batch and tech stack.
        </p>
      </div>

      <OnboardingWizard />
    </div>
  )
}
