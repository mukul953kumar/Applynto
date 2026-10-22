import { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { requireAuth } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { ApplicationForm } from "@/components/applications/application-form"
import { buttonVariants } from "@/components/ui/button"
import { ArrowLeft, AlertCircle, ExternalLink } from "lucide-react"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Track New Application | Applynto",
  description: "Log an internship application or track directly from an Applynto opportunity listing.",
}

interface NewApplicationPageProps {
  searchParams: Promise<{ internshipId?: string }>
}

export default async function NewApplicationPage({ searchParams }: NewApplicationPageProps) {
  const user = await requireAuth()
  const { internshipId } = await searchParams

  let initialValues: {
    internshipId?: string
    companyName?: string
    roleTitle?: string
    jobUrl?: string
    source?: string
  } | undefined = undefined

  if (internshipId) {
    const existing = await prisma.application.findFirst({
      where: {
        userId: user.id,
        internshipId,
      },
    })

    if (existing) {
      return (
        <div className="container max-w-2xl mx-auto py-10 px-4">
          <div className="rounded-xl border border-border/80 bg-card p-6 shadow-2xs space-y-4">
            <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400">
              <AlertCircle className="h-6 w-6 shrink-0" />
              <div>
                <h2 className="text-base font-semibold text-foreground">Already Tracked</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  You are already tracking an application for this opportunity.
                </p>
              </div>
            </div>

            <div className="rounded-lg bg-muted/40 p-4 border text-xs space-y-1">
              <p className="font-semibold text-foreground">{existing.roleTitle}</p>
              <p className="text-muted-foreground">{existing.companyName}</p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Link
                href={`/applications/${existing.id}`}
                className={buttonVariants({ size: "sm" })}
              >
                View Existing Application
              </Link>
              <Link
                href="/applications"
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                Back to All Applications
              </Link>
            </div>
          </div>
        </div>
      )
    }

    const internship = await prisma.internship.findUnique({
      where: { id: internshipId },
    })

    if (internship) {
      initialValues = {
        internshipId: internship.id,
        companyName: internship.companyName,
        roleTitle: internship.title,
        jobUrl: internship.officialApplyUrl,
        source: "Applynto Opportunity",
      }
    }
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4 md:px-6 space-y-6">
      <div className="flex items-center gap-2">
        <Link
          href="/applications"
          className={buttonVariants({ variant: "ghost", size: "sm", className: "gap-1 text-xs" })}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Applications
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {initialValues?.internshipId ? "Track Listing Application" : "Log External Application"}
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          {initialValues?.internshipId
            ? "Opportunity details prefilled. Add your submission date and resume version to track your progress."
            : "Applied directly on LinkedIn, Careers portal, or company website? Log it here to organize your search."}
        </p>
      </div>

      <ApplicationForm initialValues={initialValues} />
    </div>
  )
}
