"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { reportInternship } from "@/actions/internships"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { AlertCircle, CheckCircle2, Flag, Loader2 } from "lucide-react"

interface ReportModalProps {
  internshipId: string
  internshipTitle: string
}

export function ReportModal({ internshipId, internshipTitle }: ReportModalProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState<
    "BROKEN_LINK" | "EXPIRED" | "INCORRECT_INFO" | "SUSPICIOUS_OR_FRAUD" | "DUPLICATE" | "MISLEADING_ELIGIBILITY" | "OTHER"
  >("BROKEN_LINK")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const res = await reportInternship({
      internshipId,
      reason,
      description,
    })

    if (!res.success) {
      if (res.error?.includes("login") || res.error?.includes("auth")) {
        router.push("/login")
        return
      }
      setError(res.error || "Failed to submit report")
      setLoading(false)
      return
    }

    setSubmitted(true)
    setLoading(false)
  }

  function handleReset() {
    setSubmitted(false)
    setDescription("")
    setError(null)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive h-8 px-2.5 rounded-md hover:bg-muted transition-colors cursor-pointer">
        <Flag className="h-3.5 w-3.5" />
        <span>Report listing</span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">Report this Internship</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Help maintain platform quality for other students. Flag incorrect or suspicious information.
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="py-6 text-center space-y-3">
            <div className="h-10 w-10 mx-auto rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium">Thank you for reporting</p>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              Our moderation team will review &quot;{internshipTitle}&quot; and take corrective action if needed.
            </p>
            <div className="pt-2">
              <Button size="sm" onClick={handleReset}>
                Done
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 rounded-md bg-destructive/10 border border-destructive/20 p-2.5 text-xs text-destructive font-medium">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-medium" htmlFor="report-reason">
                Reason for reporting
              </label>
              <select
                id="report-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value as any)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="BROKEN_LINK">Broken application link</option>
                <option value="EXPIRED">Opportunity is expired / closed</option>
                <option value="INCORRECT_INFO">Incorrect details / stipend</option>
                <option value="SUSPICIOUS_OR_FRAUD">Suspicious or fraudulent listing</option>
                <option value="DUPLICATE">Duplicate listing</option>
                <option value="MISLEADING_ELIGIBILITY">Misleading eligibility / criteria</option>
                <option value="OTHER">Other issue</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium" htmlFor="report-desc">
                Additional details (optional)
              </label>
              <textarea
                id="report-desc"
                rows={3}
                placeholder="Describe what is wrong or provide a corrected link..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-md border border-input bg-background p-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Submitting...
                  </span>
                ) : (
                  "Submit Report"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
