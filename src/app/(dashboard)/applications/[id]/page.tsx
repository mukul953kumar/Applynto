import { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { requireAuth } from "@/lib/session"
import { getApplicationDetails } from "@/actions/applications"
import { ApplicationStatusBadge } from "@/components/applications/application-status-badge"
import { ApplicationDetailActions } from "@/components/applications/application-detail-actions"
import { ApplicationTimeline } from "@/components/applications/application-timeline"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"
import {
  ArrowLeft,
  ExternalLink,
  Calendar,
  Clock,
  User,
  FileText,
  Mail,
  Building2,
  MapPin,
  IndianRupee,
  CalendarCheck,
  Bell,
  Sparkles,
} from "lucide-react"

export const dynamic = "force-dynamic"

interface ApplicationDetailPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({
  params,
}: ApplicationDetailPageProps): Promise<Metadata> {
  const { id } = await params
  const app = await getApplicationDetails(id)
  if (!app) return { title: "Application Not Found | Applynto" }

  return {
    title: `${app.roleTitle} at ${app.companyName} | Applynto`,
    description: `Track status, timeline, and next actions for ${app.roleTitle} at ${app.companyName}.`,
  }
}

export default async function ApplicationDetailPage({ params }: ApplicationDetailPageProps) {
  await requireAuth()
  const { id } = await params
  const app = await getApplicationDetails(id)

  if (!app) {
    notFound()
  }

  return (
    <div className="container max-w-7xl mx-auto py-6 px-4 md:px-6 space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/applications"
          className={buttonVariants({ variant: "ghost", size: "sm", className: "gap-1 text-xs" })}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Applications
        </Link>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-xl border border-border/80 bg-card p-6 shadow-2xs">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{app.roleTitle}</h1>
            <ApplicationStatusBadge status={app.status} size="lg" />
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="font-medium text-foreground text-sm flex items-center gap-1.5">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              {app.companyName}
            </span>
            {app.jobUrl && (
              <a
                href={app.jobUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-primary hover:underline font-medium"
              >
                View Job Posting
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>

        <ApplicationDetailActions
          applicationId={app.id}
          currentStatus={app.status}
          companyName={app.companyName}
          roleTitle={app.roleTitle}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ApplicationTimeline history={app.history} />

          <Card className="border-border/80 shadow-2xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                Application Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {app.notes ? (
                <div className="rounded-lg bg-muted/40 p-4 border text-xs text-foreground/90 whitespace-pre-wrap leading-relaxed">
                  {app.notes}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">
                  No personal notes logged for this application yet.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-2xs">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                Interviews & Assessments ({app.interviews.length})
              </CardTitle>
              <Link
                href={`/interviews?applicationId=${app.id}`}
                className={buttonVariants({ variant: "outline", size: "sm", className: "text-xs h-7" })}
              >
                Manage Interviews
              </Link>
            </CardHeader>
            <CardContent>
              {app.interviews.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No interview rounds scheduled yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {app.interviews.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 p-3 text-xs"
                    >
                      <div>
                        <p className="font-medium text-foreground">{item.roundName || item.type}</p>
                        <p className="text-muted-foreground text-[11px] mt-0.5">
                          {new Date(item.scheduledAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-2xs">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Bell className="h-4 w-4 text-muted-foreground" />
                Follow-ups & Reminders ({app.reminders.length})
              </CardTitle>
              <Link
                href={`/reminders?applicationId=${app.id}`}
                className={buttonVariants({ variant: "outline", size: "sm", className: "text-xs h-7" })}
              >
                Manage Reminders
              </Link>
            </CardHeader>
            <CardContent>
              {app.reminders.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No pending reminders for this application.
                </p>
              ) : (
                <div className="space-y-3">
                  {app.reminders.map((rem) => (
                    <div
                      key={rem.id}
                      className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 p-3 text-xs"
                    >
                      <div>
                        <p className="font-medium text-foreground">{rem.title}</p>
                        <p className="text-muted-foreground text-[11px] mt-0.5">
                          Due {new Date(rem.dueAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                          })}
                        </p>
                      </div>
                      <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">
                        {rem.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-border/80 shadow-2xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Application Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div>
                <span className="text-muted-foreground block text-[11px]">Applied Date</span>
                <span className="font-medium text-foreground">
                  {app.appliedAt
                    ? new Date(app.appliedAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "Not applied yet"}
                </span>
              </div>

              <div>
                <span className="text-muted-foreground block text-[11px]">Source</span>
                <span className="font-medium text-foreground">{app.source || "Direct / Unspecified"}</span>
              </div>

              <div>
                <span className="text-muted-foreground block text-[11px]">Resume Version Tracked</span>
                <span className="font-medium text-foreground">
                  {app.resumeVersion ? (
                    <span className="inline-flex items-center gap-1 rounded bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                      <FileText className="h-3 w-3" />
                      {app.resumeVersion}
                    </span>
                  ) : (
                    "Not specified"
                  )}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-2xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-500" />
                Next Action
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              {app.nextAction ? (
                <>
                  <p className="font-medium text-foreground">{app.nextAction}</p>
                  {app.nextActionAt && (
                    <p className="text-amber-600 dark:text-amber-400 text-[11px] flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Due on{" "}
                      {new Date(app.nextActionAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-muted-foreground italic">No next action scheduled.</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-2xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                Recruiter Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div>
                <span className="text-muted-foreground block text-[11px]">Recruiter / Contact Person</span>
                <span className="font-medium text-foreground">
                  {app.recruiterName || "Not listed"}
                </span>
              </div>

              <div>
                <span className="text-muted-foreground block text-[11px]">Contact Info (Email/LinkedIn)</span>
                <span className="font-medium text-foreground break-all">
                  {app.recruiterContact || "Not listed"}
                </span>
              </div>
            </CardContent>
          </Card>

          {app.internship && (
            <Card className="border-border/80 shadow-2xs bg-primary/5 border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-primary">
                  <Sparkles className="h-4 w-4" />
                  Linked Opportunity Listing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5 text-xs">
                <p className="font-medium text-foreground">{app.internship.title}</p>
                <div className="space-y-1 text-muted-foreground text-[11px]">
                  {app.internship.location && (
                    <p className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {app.internship.location} ({app.internship.workMode.replace("_", " ")})
                    </p>
                  )}
                  {app.internship.stipendMin !== null && (
                    <p className="flex items-center gap-1 text-foreground font-medium">
                      <IndianRupee className="h-3 w-3" />
                      ₹{app.internship.stipendMin.toLocaleString("en-IN")}
                      {app.internship.stipendMax ? ` - ₹${app.internship.stipendMax.toLocaleString("en-IN")}` : ""} / month
                    </p>
                  )}
                </div>

                <div className="pt-2">
                  <Link
                    href={`/internships/${app.internship.id}`}
                    className={buttonVariants({ variant: "outline", size: "sm", className: "w-full text-xs" })}
                  >
                    View Opportunity Listing
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
