"use client"

import { useTransition } from "react"
import { resolveListingReport } from "@/actions/admin-internships"
import { Button } from "@/components/ui/button"
import { Check, X } from "lucide-react"

interface ReportActionsProps {
  reportId: string
}

export function ReportActions({ reportId }: ReportActionsProps) {
  const [isPending, startTransition] = useTransition()

  function handleResolve() {
    startTransition(async () => {
      await resolveListingReport(reportId, "RESOLVED", "Listing verified and corrected by admin")
    })
  }

  function handleDismiss() {
    startTransition(async () => {
      await resolveListingReport(reportId, "DISMISSED", "Report dismissed after review")
    })
  }

  return (
    <div className="flex items-center gap-1.5 justify-end">
      <Button
        variant="outline"
        size="sm"
        disabled={isPending}
        onClick={handleDismiss}
        className="h-7 text-[11px] px-2 text-muted-foreground hover:text-foreground"
      >
        <X className="h-3 w-3 mr-1" />
        Dismiss
      </Button>
      <Button
        size="sm"
        disabled={isPending}
        onClick={handleResolve}
        className="h-7 text-[11px] px-2"
      >
        <Check className="h-3 w-3 mr-1" />
        Resolve
      </Button>
    </div>
  )
}
