import { InterviewStatus, InterviewResult, InterviewType } from "@prisma/client"
import { cn } from "@/lib/utils"

export const INTERVIEW_TYPE_LABELS: Record<InterviewType, string> = {
  ONLINE_ASSESSMENT: "Online Assessment (OA)",
  CODING_ROUND: "Coding Round",
  TECHNICAL_INTERVIEW: "Technical Interview",
  HR_INTERVIEW: "HR Interview",
  MANAGERIAL_INTERVIEW: "Managerial / Fit",
  TAKE_HOME_ASSIGNMENT: "Take-Home Assignment",
  OTHER: "Other Round",
}

interface InterviewStatusBadgeProps {
  status: InterviewStatus
  result?: InterviewResult
  className?: string
}

export function InterviewStatusBadge({ status, result, className }: InterviewStatusBadgeProps) {
  if (result && result !== InterviewResult.PENDING) {
    if (result === InterviewResult.CLEARED) {
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium border bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
            className
          )}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Cleared Round
        </span>
      )
    }

    if (result === InterviewResult.REJECTED) {
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium border bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800",
            className
          )}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
          Not Cleared
        </span>
      )
    }

    if (result === InterviewResult.CANCELLED) {
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium border bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700",
            className
          )}
        >
          Cancelled
        </span>
      )
    }
  }

  const statusConfigs: Record<InterviewStatus, { label: string; class: string; dot: string }> = {
    SCHEDULED: {
      label: "Scheduled",
      class: "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800",
      dot: "bg-blue-500",
    },
    COMPLETED: {
      label: "Completed",
      class: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
      dot: "bg-emerald-500",
    },
    RESCHEDULED: {
      label: "Rescheduled",
      class: "bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800",
      dot: "bg-amber-500",
    },
    CANCELLED: {
      label: "Cancelled",
      class: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700",
      dot: "bg-zinc-500",
    },
  }

  const cfg = statusConfigs[status] || statusConfigs.SCHEDULED

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium border",
        cfg.class,
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} />
      {cfg.label}
    </span>
  )
}
