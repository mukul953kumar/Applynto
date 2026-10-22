import { requireAuth } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ApplicationStatus } from "@prisma/client"
import { ArrowRight, Briefcase, Calendar, CheckSquare, Layers, Plus } from "lucide-react"

export const metadata = {
  title: "Dashboard | Applynto",
  description: "Monitor your internship applications, interviews, and deadlines.",
}

export default async function DashboardPage() {
  const user = await requireAuth()

  const [totalApplications, activeApplications, upcomingInterviews, pendingReminders] = await Promise.all([
    prisma.application.count({
      where: { userId: user.id },
    }),
    prisma.application.count({
      where: {
        userId: user.id,
        status: {
          in: [
            ApplicationStatus.APPLIED,
            ApplicationStatus.ASSESSMENT,
            ApplicationStatus.INTERVIEW,
            ApplicationStatus.ON_HOLD,
          ],
        },
      },
    }),
    prisma.interview.count({
      where: {
        userId: user.id,
        scheduledAt: { gte: new Date() },
      },
    }),
    prisma.reminder.count({
      where: {
        userId: user.id,
        status: "PENDING",
      },
    }),
  ])

  const recentApplications = await prisma.application.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    take: 5,
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome back, {user.name || "Student"}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Here is an overview of your active applications and upcoming action items.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/internships" className={buttonVariants({ variant: "outline", size: "sm", className: "gap-1.5" })}>
            <Briefcase className="h-4 w-4" /> Browse Listings
          </Link>
          <Link href="/applications/new" className={buttonVariants({ size: "sm", className: "gap-1.5" })}>
            <Plus className="h-4 w-4" /> Track Application
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">Total Applications</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalApplications}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Tracked across all stages</p>
          </CardContent>
        </Card>

        <Card className="shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">Active in Pipeline</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeApplications}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Pending review, OA, or interviews</p>
          </CardContent>
        </Card>

        <Card className="shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">Upcoming Interviews</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingInterviews}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Rounds scheduled in future</p>
          </CardContent>
        </Card>

        <Card className="shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">Actionable Tasks</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingReminders}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Pending reminders and follow-ups</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="shadow-2xs">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Recent Applications</CardTitle>
                <CardDescription className="text-xs">Your most recently updated opportunities.</CardDescription>
              </div>
              <Link href="/applications" className={buttonVariants({ variant: "ghost", size: "sm", className: "text-xs gap-1" })}>
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </CardHeader>
            <CardContent>
              {recentApplications.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground space-y-2">
                  <p className="text-sm">No applications tracked yet.</p>
                  <Link href="/applications/new" className={buttonVariants({ variant: "outline", size: "sm" })}>
                    Add your first application
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-border/60">
                  {recentApplications.map((app) => (
                    <div key={app.id} className="py-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{app.roleTitle}</p>
                        <p className="text-xs text-muted-foreground">{app.companyName}</p>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-muted text-foreground">
                          {app.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="shadow-2xs">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Next Action Items</CardTitle>
              <CardDescription className="text-xs">Upcoming deadlines and reminders.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="py-6 text-center text-muted-foreground space-y-2">
                <p className="text-sm">No urgent follow-ups right now.</p>
                <Link href="/reminders" className={buttonVariants({ variant: "ghost", size: "sm", className: "text-xs" })}>
                  Manage Reminders
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
