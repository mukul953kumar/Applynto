import { Metadata } from "next"
import Link from "next/link"
import { requireAuth } from "@/lib/session"
import { getDashboardData } from "@/actions/dashboard"
import { DashboardFunnelChart } from "@/components/dashboard/dashboard-funnel-chart"
import { DashboardFocusSection } from "@/components/dashboard/dashboard-focus-section"
import { ApplicationStatusBadge } from "@/components/applications/application-status-badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"
import {
  Briefcase,
  Layers,
  Calendar,
  CheckSquare,
  Trophy,
  TrendingUp,
  Plus,
  ArrowRight,
  Video,
  Clock,
  Sparkles,
  ExternalLink,
} from "lucide-react"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Dashboard | Applynto",
  description: "Monitor your internship applications, interview pipeline, deadlines, and metrics.",
}

export default async function DashboardPage() {
  const user = await requireAuth()
  const data = await getDashboardData()

  return (
    <div className="container max-w-7xl mx-auto py-6 px-4 md:px-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Welcome back, {user.name || "Student"}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Your centralized internship pipeline, upcoming rounds, and actionable deadlines.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/internships"
            className={buttonVariants({ variant: "outline", size: "sm", className: "gap-1.5 text-xs" })}
          >
            <Briefcase className="h-3.5 w-3.5" />
            Browse Listings
          </Link>
          <Link
            href="/applications/new"
            className={buttonVariants({ size: "sm", className: "gap-1.5 text-xs font-medium" })}
          >
            <Plus className="h-3.5 w-3.5" />
            Track Application
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="rounded-xl border border-border/80 bg-card p-3.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-muted-foreground">Total Applications</span>
            <Layers className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <p className="text-xl font-bold text-foreground mt-1">{data.metrics.totalApplications}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Across all stages</p>
        </div>

        <div className="rounded-xl border border-border/80 bg-card p-3.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-muted-foreground">Active Pipeline</span>
            <span className="h-2 w-2 rounded-full bg-blue-500" />
          </div>
          <p className="text-xl font-bold text-foreground mt-1">{data.metrics.activePipelineCount}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">In review, OA, or round</p>
        </div>

        <div className="rounded-xl border border-border/80 bg-card p-3.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-muted-foreground">Upcoming Rounds</span>
            <Calendar className="h-3.5 w-3.5 text-amber-500" />
          </div>
          <p className="text-xl font-bold text-foreground mt-1">{data.metrics.upcomingInterviewsCount}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Scheduled tests & calls</p>
        </div>

        <div className="rounded-xl border border-border/80 bg-card p-3.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-muted-foreground">Offers Received</span>
            <Trophy className="h-3.5 w-3.5 text-emerald-500" />
          </div>
          <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {data.metrics.offersCount}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Offers extended</p>
        </div>

        <div className="rounded-xl border border-border/80 bg-card p-3.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-muted-foreground">Conversion Rate</span>
            <TrendingUp className="h-3.5 w-3.5 text-indigo-500" />
          </div>
          <p className="text-xl font-bold text-foreground mt-1">{data.metrics.conversionRate}%</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Applied to OA/Interview</p>
        </div>

        <div className="rounded-xl border border-border/80 bg-card p-3.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-muted-foreground">Actionable Tasks</span>
            <CheckSquare className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <p className="text-xl font-bold text-foreground mt-1">{data.metrics.pendingRemindersCount}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Pending follow-ups</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardFocusSection items={data.focusItems} />
        <DashboardFunnelChart data={data.stageFunnelData} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/80 shadow-2xs">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Upcoming Interviews & Assessments
            </CardTitle>
            <Link
              href="/interviews"
              className={buttonVariants({ variant: "ghost", size: "sm", className: "h-7 text-xs gap-1" })}
            >
              View All
              <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {data.upcomingInterviews.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground border border-dashed rounded-lg">
                <p>No upcoming interviews or assessments scheduled.</p>
                <Link
                  href="/interviews"
                  className={buttonVariants({ variant: "outline", size: "sm", className: "mt-2 text-xs" })}
                >
                  Schedule Round
                </Link>
              </div>
            ) : (
              <div className="space-y-2.5">
                {data.upcomingInterviews.map((item) => {
                  const scheduled = new Date(item.scheduledAt)
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border/60 bg-muted/20 text-xs"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground truncate">
                          {item.roundName || item.type.replace(/_/g, " ")}
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {item.application.companyName} • {item.application.roleTitle}
                        </p>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Clock className="h-3 w-3" />
                          {scheduled.toLocaleDateString("en-IN", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {item.meetingUrl && (
                          <a
                            href={item.meetingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={buttonVariants({
                              variant: "outline",
                              size: "sm",
                              className: "h-7 px-2 text-[11px] gap-1",
                            })}
                          >
                            <Video className="h-3 w-3" />
                            Join
                          </a>
                        )}
                        <Link
                          href={`/applications/${item.application.id}`}
                          className={buttonVariants({
                            variant: "ghost",
                            size: "sm",
                            className: "h-7 px-2 text-[11px]",
                          })}
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-2xs">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-primary" />
              Recently Updated Applications
            </CardTitle>
            <Link
              href="/applications"
              className={buttonVariants({ variant: "ghost", size: "sm", className: "h-7 text-xs gap-1" })}
            >
              View All
              <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {data.recentApplications.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground border border-dashed rounded-lg">
                <p>You haven't tracked any applications yet.</p>
                <Link
                  href="/applications/new"
                  className={buttonVariants({ size: "sm", className: "mt-2 text-xs" })}
                >
                  Track Application
                </Link>
              </div>
            ) : (
              <div className="space-y-2.5">
                {data.recentApplications.map((app) => (
                  <div
                    key={app.id}
                    className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border/60 bg-card hover:bg-muted/30 transition-colors text-xs"
                  >
                    <div className="min-w-0">
                      <Link
                        href={`/applications/${app.id}`}
                        className="font-semibold text-foreground hover:text-primary transition-colors block truncate"
                      >
                        {app.roleTitle}
                      </Link>
                      <p className="text-[11px] text-muted-foreground truncate">{app.companyName}</p>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <ApplicationStatusBadge status={app.status} size="sm" />
                      <Link
                        href={`/applications/${app.id}`}
                        className={buttonVariants({
                          variant: "ghost",
                          size: "sm",
                          className: "h-7 px-2 text-[11px]",
                        })}
                      >
                        Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
