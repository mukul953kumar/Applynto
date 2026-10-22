"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Priority, ReminderStatus, ReminderType } from "@prisma/client"
import { toggleReminderStatus, snoozeReminder, deleteReminder } from "@/actions/reminders"
import { Button } from "@/components/ui/button"
import {
  Clock,
  AlertCircle,
  Calendar,
  Briefcase,
  Trash2,
  Loader2,
  MoreVertical,
  Check,
  RotateCw,
} from "lucide-react"

export type ReminderWithApplication = {
  id: string
  title: string
  description: string | null
  type: ReminderType
  dueAt: Date
  timeZone: string
  priority: Priority
  status: ReminderStatus
  completedAt: Date | null
  application: {
    id: string
    companyName: string
    roleTitle: string
  } | null
}

interface ReminderItemProps {
  reminder: ReminderWithApplication
}

export function ReminderItem({ reminder }: ReminderItemProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [snoozing, setSnoozing] = useState(false)

  const isCompleted = reminder.status === ReminderStatus.COMPLETED
  const dueDate = new Date(reminder.dueAt)
  const now = new Date()
  const isOverdue = !isCompleted && dueDate < now

  async function handleToggle() {
    setLoading(true)
    const res = await toggleReminderStatus(reminder.id)
    setLoading(false)
    if (res.success) {
      router.refresh()
    } else {
      alert(res.error || "Failed to update reminder status")
    }
  }

  async function handleSnooze(hours: number) {
    setSnoozing(true)
    const res = await snoozeReminder(reminder.id, hours)
    setSnoozing(false)
    if (res.success) {
      router.refresh()
    } else {
      alert(res.error || "Failed to snooze reminder")
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this reminder?")) {
      return
    }

    setLoading(true)
    const res = await deleteReminder(reminder.id)
    setLoading(false)
    if (res.success) {
      router.refresh()
    } else {
      alert(res.error || "Failed to delete reminder")
    }
  }

  const priorityStyles: Record<Priority, { label: string; class: string }> = {
    URGENT: {
      label: "Urgent",
      class: "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800",
    },
    HIGH: {
      label: "High",
      class: "bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    },
    MEDIUM: {
      label: "Medium",
      class: "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    },
    LOW: {
      label: "Low",
      class: "bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700",
    },
  }

  const pr = priorityStyles[reminder.priority] || priorityStyles.MEDIUM

  return (
    <div
      className={`group flex items-start gap-3 rounded-xl border p-3.5 transition-all ${
        isCompleted
          ? "bg-muted/20 border-border/50 opacity-70"
          : isOverdue
          ? "bg-rose-500/5 border-rose-500/30 shadow-2xs"
          : "bg-card border-border/80 shadow-2xs hover:border-primary/40"
      }`}
    >
      <button
        type="button"
        onClick={handleToggle}
        disabled={loading}
        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
          isCompleted
            ? "border-primary bg-primary text-primary-foreground"
            : "border-muted-foreground/60 hover:border-primary bg-background"
        }`}
      >
        {loading ? (
          <Loader2 className="h-2.5 w-2.5 animate-spin" />
        ) : isCompleted ? (
          <Check className="h-3 w-3 stroke-[3]" />
        ) : null}
      </button>

      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`text-xs font-semibold leading-tight ${
              isCompleted ? "line-through text-muted-foreground" : "text-foreground"
            }`}
          >
            {reminder.title}
          </span>
          <span className={`rounded-full px-2 py-0.2 text-[10px] font-semibold border ${pr.class}`}>
            {pr.label}
          </span>
        </div>

        {reminder.description && (
          <p
            className={`text-xs ${
              isCompleted ? "line-through text-muted-foreground/60" : "text-muted-foreground"
            }`}
          >
            {reminder.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3 text-[11px] pt-1 text-muted-foreground">
          <span
            className={`flex items-center gap-1 font-medium ${
              isOverdue
                ? "text-rose-600 dark:text-rose-400 font-semibold"
                : isCompleted
                ? "text-muted-foreground"
                : "text-foreground"
            }`}
          >
            {isOverdue ? (
              <AlertCircle className="h-3 w-3 shrink-0 text-rose-500" />
            ) : (
              <Clock className="h-3 w-3 shrink-0" />
            )}
            {isOverdue && "Overdue: "}
            {dueDate.toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>

          {reminder.application && (
            <Link
              href={`/applications/${reminder.application.id}`}
              className="inline-flex items-center gap-1 text-primary hover:underline font-medium"
            >
              <Briefcase className="h-3 w-3 shrink-0" />
              <span>
                {reminder.application.companyName} • {reminder.application.roleTitle}
              </span>
            </Link>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
        {!isCompleted && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSnooze(24)}
            disabled={snoozing}
            className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground"
            title="Snooze 24 hours"
          >
            {snoozing ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <RotateCw className="h-3 w-3 mr-1" />
            )}
            +1d
          </Button>
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={handleDelete}
          disabled={loading}
          className="h-7 w-7 text-muted-foreground hover:text-destructive"
          title="Delete reminder"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}
