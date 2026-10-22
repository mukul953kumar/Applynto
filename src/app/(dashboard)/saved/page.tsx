import { requireAuth } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { SaveButton } from "@/components/internships/save-button"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import {
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Layers,
  MapPin,
  FolderBookmark,
  ArrowRight,
} from "lucide-react"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Saved Internships | Applynto",
  description: "View and organize the internships you saved to apply later.",
}

export default async function SavedInternshipsPage() {
  const user = await requireAuth()

  const savedItems = await prisma.savedInternship.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      internship: true,
    },
  })

  const existingApplications = await prisma.application.findMany({
    where: {
      userId: user.id,
      internshipId: { in: savedItems.map((s) => s.internshipId) },
    },
    select: { id: true, internshipId: true },
  })

  const applicationMap = new Map(existingApplications.map((a) => [a.internshipId, a.id]))
  const now = new Date()

  const workModeLabels: Record<string, string> = {
    REMOTE: "Remote",
    HYBRID: "Hybrid",
    ON_SITE: "On-site",
    NOT_SPECIFIED: "Not specified",
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Saved Internships</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Keep track of roles you want to revisit and apply to before their deadlines.
          </p>
        </div>

        <Link href="/internships" className={buttonVariants({ variant: "outline", size: "sm", className: "gap-1.5" })}>
          <Briefcase className="h-4 w-4" /> Browse More Roles
        </Link>
      </div>

      {savedItems.length === 0 ? (
        <div className="bg-card border border-border/80 rounded-lg p-12 text-center space-y-3 shadow-2xs">
          <div className="h-12 w-12 mx-auto rounded-full bg-muted flex items-center justify-center text-muted-foreground">
            <FolderBookmark className="h-6 w-6" />
          </div>
          <h3 className="font-semibold text-base">You haven&apos;t saved any internships yet</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            When you browse opportunities, click the bookmark icon to save roles here for later review.
          </p>
          <div className="pt-2">
            <Link href="/internships" className={buttonVariants({ size: "sm", className: "text-xs gap-1.5" })}>
              <span>Explore Internships</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {savedItems.map(({ internship }) => {
            const isExpired = internship.deadline ? internship.deadline < now : false
            const appId = applicationMap.get(internship.id)

            return (
              <Card key={internship.id} className="flex flex-col justify-between border-border/80 shadow-2xs">
                <CardHeader className="pb-3 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted border border-border text-xs font-bold text-foreground">
                        {internship.companyName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground line-clamp-1">{internship.companyName}</p>
                        <h3 className="font-semibold text-sm leading-snug line-clamp-1 text-foreground">
                          <Link href={`/internships/${internship.id}`} className="hover:underline">
                            {internship.title}
                          </Link>
                        </h3>
                      </div>
                    </div>
                    <SaveButton internshipId={internship.id} initialSaved={true} size="icon" />
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="outline" className="text-[11px] font-normal">
                      {workModeLabels[internship.workMode] || internship.workMode}
                    </Badge>

                    {internship.verificationStatus === "VERIFIED" && (
                      <Badge variant="secondary" className="text-[11px] font-medium gap-1 text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                        <CheckCircle2 className="h-3 w-3" /> Verified
                      </Badge>
                    )}

                    {isExpired && (
                      <Badge variant="destructive" className="text-[11px]">
                        Expired
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 pb-3">
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {internship.shortDescription}
                  </p>

                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                    <span className="font-medium text-foreground">
                      {internship.stipendMin ? `₹${internship.stipendMin.toLocaleString("en-IN")}/mo` : "Stipend not specified"}
                    </span>
                    <span className="flex items-center gap-1 text-[11px]">
                      <Clock className="h-3 w-3" />
                      {internship.deadline
                        ? new Date(internship.deadline).toLocaleDateString("en-IN", {
                            month: "short",
                            day: "numeric",
                          })
                        : "Rolling"}
                    </span>
                  </div>
                </CardContent>

                <CardFooter className="pt-3 border-t border-border/60 flex items-center justify-between gap-2">
                  <a
                    href={internship.officialApplyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonVariants({ variant: "outline", size: "sm", className: "h-8 text-xs gap-1 px-2.5" })}
                  >
                    <span>Apply</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>

                  {appId ? (
                    <Link
                      href={`/applications/${appId}`}
                      className={buttonVariants({ variant: "ghost", size: "sm", className: "h-8 text-xs gap-1 text-primary" })}
                    >
                      <Layers className="h-3.5 w-3.5" />
                      <span>Tracked</span>
                    </Link>
                  ) : (
                    <Link
                      href={`/applications/new?internshipId=${internship.id}`}
                      className={buttonVariants({ size: "sm", className: "h-8 text-xs gap-1" })}
                    >
                      <span>Track</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  )}
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
