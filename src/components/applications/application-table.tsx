"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ApplicationStatus } from "@prisma/client"
import { ApplicationStatusBadge } from "@/components/applications/application-status-badge"
import { StageTransitionDialog } from "@/components/applications/stage-transition-dialog"
import { deleteApplication } from "@/actions/applications"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  ExternalLink,
  ChevronRight,
  Trash2,
  Calendar,
  Clock,
  Sparkles,
  Loader2,
} from "lucide-react"

type ApplicationItem = {
  id: string
  companyName: string
  roleTitle: string
  jobUrl: string | null
  status: ApplicationStatus
  appliedAt: Date | null
  nextAction: string | null
  nextActionAt: Date | null
  resumeVersion: string | null
  recruiterName: string | null
  recruiterContact: string | null
  _count: {
    interviews: number
    reminders: number
  }
}

interface ApplicationTableProps {
  applications: ApplicationItem[]
}

export function ApplicationTable({ applications }: ApplicationTableProps) {
  const router = useRouter()
  const [selectedApp, setSelectedApp] = useState<ApplicationItem | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleDelete(id: string, e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    if (!confirm("Are you sure you want to delete this application? All linked status history will also be removed.")) {
      return
    }

    setDeletingId(id)
    const res = await deleteApplication(id)
    setDeletingId(null)

    if (res.success) {
      router.refresh()
    } else {
      alert(res.error || "Failed to delete application")
    }
  }

  if (applications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/80 p-12 text-center bg-card/50">
        <div className="rounded-full bg-primary/10 p-3 text-primary mb-3">
          <Sparkles className="h-6 w-6" />
        </div>
        <h3 className="text-base font-semibold text-foreground">No applications found</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm">
          You haven't tracked any applications matching your criteria yet. Log one manually or track directly from public listings.
        </p>
        <Link
          href="/applications/new"
          className={buttonVariants({ size: "sm", className: "mt-4 gap-1.5" })}
        >
          Track New Application
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-muted/40 text-xs text-muted-foreground font-medium uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Role & Company</th>
                <th className="py-3 px-4">Current Stage</th>
                <th className="py-3 px-4">Applied Date</th>
                <th className="py-3 px-4">Next Action</th>
                <th className="py-3 px-4">Activity</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {applications.map((app) => (
                <tr
                  key={app.id}
                  className="group hover:bg-muted/30 transition-colors"
                >
                  <td className="py-3.5 px-4">
                    <Link
                      href={`/applications/${app.id}`}
                      className="font-medium text-foreground hover:text-primary transition-colors block text-sm leading-tight"
                    >
                      {app.roleTitle}
                    </Link>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <span>{app.companyName}</span>
                      {app.jobUrl && (
                        <a
                          href={app.jobUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-foreground inline-flex items-center gap-0.5 text-[11px]"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Link
                        </a>
                      )}
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <button
                      type="button"
                      onClick={() => setSelectedApp(app)}
                      className="cursor-pointer transition-transform active:scale-95 text-left"
                      title="Click to update status"
                    >
                      <ApplicationStatusBadge status={app.status} size="sm" />
                    </button>
                  </td>

                  <td className="py-3.5 px-4 text-xs text-muted-foreground whitespace-nowrap">
                    {app.appliedAt ? (
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(app.appliedAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    ) : (
                      <span className="text-muted-foreground/60 italic">Not applied yet</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 max-w-xs">
                    {app.nextAction ? (
                      <div>
                        <p className="text-xs font-medium text-foreground truncate">
                          {app.nextAction}
                        </p>
                        {app.nextActionAt && (
                          <span className="flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 mt-0.5">
                            <Clock className="h-3 w-3 shrink-0" />
                            Due {new Date(app.nextActionAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground/60">—</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {app._count.interviews > 0 && (
                        <span className="inline-flex items-center gap-1 rounded bg-secondary px-1.5 py-0.5 text-[11px] font-medium text-secondary-foreground">
                          {app._count.interviews} {app._count.interviews === 1 ? "interview" : "interviews"}
                        </span>
                      )}
                      {app._count.reminders > 0 && (
                        <span className="inline-flex items-center gap-1 rounded bg-secondary px-1.5 py-0.5 text-[11px] font-medium text-secondary-foreground">
                          {app._count.reminders} reminder
                        </span>
                      )}
                      {app._count.interviews === 0 && app._count.reminders === 0 && (
                        <span className="text-muted-foreground/60 text-xs">—</span>
                      )}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/applications/${app.id}`}
                        className={buttonVariants({
                          variant: "ghost",
                          size: "sm",
                          className: "h-8 px-2 text-xs gap-1",
                        })}
                      >
                        Details
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleDelete(app.id, e)}
                        disabled={deletingId === app.id}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        title="Delete application"
                      >
                        {deletingId === app.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedApp && (
        <StageTransitionDialog
          isOpen={!!selectedApp}
          onClose={() => setSelectedApp(null)}
          applicationId={selectedApp.id}
          currentStatus={selectedApp.status}
          companyName={selectedApp.companyName}
          roleTitle={selectedApp.roleTitle}
        />
      )}
    </>
  )
}
