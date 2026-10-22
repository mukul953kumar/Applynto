"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ApplicationStatus } from "@prisma/client"
import { STATUS_CONFIG, ApplicationStatusBadge } from "@/components/applications/application-status-badge"
import { StageTransitionDialog } from "@/components/applications/stage-transition-dialog"
import { updateApplicationStage } from "@/actions/applications"
import {
  ExternalLink,
  Clock,
  ChevronRight,
  MoreHorizontal,
  Calendar,
  Sparkles,
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

interface ApplicationKanbanProps {
  applications: ApplicationItem[]
}

const KANBAN_COLUMNS: { status: ApplicationStatus; title: string; hint: string }[] = [
  { status: ApplicationStatus.SAVED, title: "Saved", hint: "Bookmarked to apply" },
  { status: ApplicationStatus.APPLIED, title: "Applied", hint: "Application submitted" },
  { status: ApplicationStatus.ASSESSMENT, title: "Assessment / OA", hint: "Coding test or assignment" },
  { status: ApplicationStatus.INTERVIEW, title: "Interview", hint: "Technical or HR rounds" },
  { status: ApplicationStatus.OFFER, title: "Offer", hint: "Offer letter received" },
  { status: ApplicationStatus.REJECTED, title: "Rejected", hint: "Did not move forward" },
  { status: ApplicationStatus.WITHDRAWN, title: "Withdrawn", hint: "Withdrawn by candidate" },
  { status: ApplicationStatus.ON_HOLD, title: "On Hold", hint: "Process delayed/paused" },
]

export function ApplicationKanban({ applications }: ApplicationKanbanProps) {
  const router = useRouter()
  const [selectedApp, setSelectedApp] = useState<ApplicationItem | null>(null)
  const [draggingAppId, setDraggingAppId] = useState<string | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<ApplicationStatus | null>(null)

  const grouped = KANBAN_COLUMNS.reduce<Record<ApplicationStatus, ApplicationItem[]>>(
    (acc, col) => {
      acc[col.status] = applications.filter((app) => app.status === col.status)
      return acc
    },
    {} as Record<ApplicationStatus, ApplicationItem[]>
  )

  function handleDragStart(e: React.DragEvent, appId: string) {
    e.dataTransfer.setData("text/plain", appId)
    setDraggingAppId(appId)
  }

  function handleDragOver(e: React.DragEvent, status: ApplicationStatus) {
    e.preventDefault()
    setDragOverColumn(status)
  }

  function handleDragLeave(status: ApplicationStatus) {
    if (dragOverColumn === status) {
      setDragOverColumn(null)
    }
  }

  async function handleDrop(e: React.DragEvent, targetStatus: ApplicationStatus) {
    e.preventDefault()
    setDragOverColumn(null)
    const appId = e.dataTransfer.getData("text/plain") || draggingAppId
    setDraggingAppId(null)

    if (!appId) return

    const app = applications.find((a) => a.id === appId)
    if (!app || app.status === targetStatus) return

    const res = await updateApplicationStage({
      applicationId: appId,
      newStatus: targetStatus,
    })

    if (res.success) {
      router.refresh()
    } else {
      alert(res.error || "Failed to update stage")
    }
  }

  return (
    <>
      <div className="flex gap-4 overflow-x-auto pb-4 pt-1 items-start min-h-[600px] scrollbar-thin">
        {KANBAN_COLUMNS.map((col) => {
          const items = grouped[col.status] || []
          const cfg = STATUS_CONFIG[col.status]
          const isOver = dragOverColumn === col.status

          return (
            <div
              key={col.status}
              onDragOver={(e) => handleDragOver(e, col.status)}
              onDragLeave={() => handleDragLeave(col.status)}
              onDrop={(e) => handleDrop(e, col.status)}
              className={`w-72 shrink-0 rounded-xl border bg-muted/20 flex flex-col max-h-[820px] transition-colors ${
                isOver ? "border-primary/60 bg-primary/5 ring-2 ring-primary/20" : "border-border/70"
              }`}
            >
              <div className="p-3 border-b border-border/60 bg-muted/40 rounded-t-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${cfg.dotClass}`} />
                    <h4 className="text-xs font-semibold text-foreground">{col.title}</h4>
                  </div>
                  <span className="rounded-full bg-background px-2 py-0.5 text-[11px] font-semibold text-foreground/80 border border-border/60 shadow-2xs">
                    {items.length}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">{col.hint}</p>
              </div>

              <div className="p-2 space-y-2.5 overflow-y-auto flex-1 scrollbar-thin min-h-[140px]">
                {items.length === 0 ? (
                  <div className="h-28 flex flex-col items-center justify-center rounded-lg border border-dashed border-border/60 text-center p-3">
                    <p className="text-[11px] text-muted-foreground">Drop here to move</p>
                  </div>
                ) : (
                  items.map((app) => (
                    <div
                      key={app.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, app.id)}
                      onDragEnd={() => setDraggingAppId(null)}
                      className="group rounded-lg border border-border/80 bg-card p-3 shadow-2xs hover:shadow-xs hover:border-primary/40 transition-all cursor-grab active:cursor-grabbing relative"
                    >
                      <div className="flex items-start justify-between gap-1">
                        <Link
                          href={`/applications/${app.id}`}
                          className="font-medium text-xs text-foreground hover:text-primary transition-colors line-clamp-1 block"
                        >
                          {app.roleTitle}
                        </Link>
                        <button
                          type="button"
                          onClick={() => setSelectedApp(app)}
                          className="text-muted-foreground hover:text-foreground shrink-0 p-0.5 rounded hover:bg-muted/60"
                          title="Change stage"
                        >
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between gap-2 mt-1">
                        <span className="text-xs text-muted-foreground truncate">{app.companyName}</span>
                        {app.jobUrl && (
                          <a
                            href={app.jobUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-foreground text-[11px] inline-flex items-center gap-0.5"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>

                      {app.nextAction && (
                        <div className="mt-2.5 rounded bg-muted/60 p-1.5 text-[11px] border border-border/40">
                          <p className="font-medium text-foreground truncate">{app.nextAction}</p>
                          {app.nextActionAt && (
                            <span className="flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 mt-0.5">
                              <Clock className="h-3 w-3 shrink-0" />
                              {new Date(app.nextActionAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                              })}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="mt-3 pt-2 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground">
                        {app.appliedAt ? (
                          <span className="flex items-center gap-1 text-[10px]">
                            <Calendar className="h-3 w-3" />
                            {new Date(app.appliedAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                        ) : (
                          <span className="text-[10px] italic text-muted-foreground/60">Not applied</span>
                        )}

                        <div className="flex items-center gap-1.5">
                          {app._count.interviews > 0 && (
                            <span className="rounded bg-secondary px-1 py-0.2 text-[10px] font-medium text-secondary-foreground">
                              {app._count.interviews} OA/Int
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => setSelectedApp(app)}
                            className="text-[10px] font-medium text-primary hover:underline"
                          >
                            Move
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )
        })}
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
