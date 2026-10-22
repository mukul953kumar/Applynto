import { ApplicationStatus } from "@prisma/client"
import { cn } from "@/lib/utils"

export const STATUS_CONFIG: Record<
  ApplicationStatus,
  { label: string; badgeClass: string; dotClass: string }
> = {
  SAVED: {
    label: "Saved",
    badgeClass: "bg-slate-100 text-slate-700 dark:bg-slate-800/80 dark:text-slate-300 border-slate-200 dark:border-slate-700",
    dotClass: "bg-slate-500",
  },
  APPLIED: {
    label: "Applied",
    badgeClass: "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    dotClass: "bg-blue-500",
  },
  ASSESSMENT: {
    label: "Assessment / OA",
    badgeClass: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
    dotClass: "bg-indigo-500",
  },
  INTERVIEW: {
    label: "Interviewing",
    badgeClass: "bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    dotClass: "bg-amber-500",
  },
  OFFER: {
    label: "Offer Received",
    badgeClass: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 font-medium",
    dotClass: "bg-emerald-500",
  },
  REJECTED: {
    label: "Rejected",
    badgeClass: "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800",
    dotClass: "bg-rose-500",
  },
  WITHDRAWN: {
    label: "Withdrawn",
    badgeClass: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800/80 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700",
    dotClass: "bg-zinc-500",
  },
  ON_HOLD: {
    label: "On Hold",
    badgeClass: "bg-yellow-50 text-yellow-800 dark:bg-yellow-950/60 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800",
    dotClass: "bg-yellow-500",
  },
}

interface ApplicationStatusBadgeProps {
  status: ApplicationStatus
  size?: "sm" | "md" | "lg"
  showDot?: boolean
  className?: string
}

export function ApplicationStatusBadge({
  status,
  size = "md",
  showDot = true,
  className,
}: ApplicationStatusBadgeProps) {
  const config = STATUS_CONFIG[status] || {
    label: status,
    badgeClass: "bg-muted text-muted-foreground border-border",
    dotClass: "bg-muted-foreground",
  }

  const sizeClasses = {
    sm: "text-[11px] px-2 py-0.5 gap-1",
    md: "text-xs px-2.5 py-1 gap-1.5",
    lg: "text-sm px-3 py-1.5 gap-2",
  }

  const dotSizes = {
    sm: "h-1.5 w-1.5",
    md: "h-2 w-2",
    lg: "h-2.5 w-2.5",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full border shadow-2xs whitespace-nowrap",
        config.badgeClass,
        sizeClasses[size],
        className
      )}
    >
      {showDot && (
        <span
          className={cn("rounded-full shrink-0", config.dotClass, dotSizes[size])}
        />
      )}
      {config.label}
    </span>
  )
}
