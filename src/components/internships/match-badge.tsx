import { MatchResult } from "@/lib/matching"
import { Sparkles, Check, AlertCircle } from "lucide-react"

interface MatchBadgeProps {
  match: MatchResult
  className?: string
  showDetails?: boolean
}

export function MatchBadge({ match, className, showDetails = false }: MatchBadgeProps) {
  if (match.score === 0) return null

  const tierStyles = {
    STRONG: {
      badge: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
      dot: "bg-emerald-500",
      label: "Strong Match",
    },
    GOOD: {
      badge: "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800",
      dot: "bg-blue-500",
      label: "Good Match",
    },
    MODERATE: {
      badge: "bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800",
      dot: "bg-amber-500",
      label: "Moderate Match",
    },
    LOW: {
      badge: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700",
      dot: "bg-slate-500",
      label: "Low Match",
    },
  }

  const style = tierStyles[match.tier]

  return (
    <div className="inline-flex flex-col gap-1">
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border shadow-2xs ${style.badge} ${className || ""}`}
        title={`${match.matchingSkills.length} matching skills, ${match.isGradYearEligible ? "batch eligible" : "batch mismatch"}`}
      >
        <Sparkles className="h-3 w-3 shrink-0" />
        <span>{match.score}% {style.label}</span>
      </span>

      {showDetails && (
        <div className="text-[11px] text-muted-foreground space-y-0.5 pt-1">
          {match.matchingSkills.length > 0 && (
            <p className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <Check className="h-3 w-3 shrink-0" />
              <span>Skills: {match.matchingSkills.slice(0, 3).join(", ")}</span>
            </p>
          )}
          {!match.isGradYearEligible && (
            <p className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
              <AlertCircle className="h-3 w-3 shrink-0" />
              <span>Check batch eligibility criteria</span>
            </p>
          )}
        </div>
      )}
    </div>
  )
}
