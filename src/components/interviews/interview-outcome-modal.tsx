"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { InterviewStatus, InterviewResult } from "@prisma/client"
import { updateInterview } from "@/actions/interviews"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, X, Award } from "lucide-react"

interface InterviewOutcomeModalProps {
  isOpen: boolean
  onClose: () => void
  interviewId: string
  companyName: string
  roundTitle: string
  currentStatus: InterviewStatus
  currentResult: InterviewResult
  currentFeedback?: string | null
}

export function InterviewOutcomeModal({
  isOpen,
  onClose,
  interviewId,
  companyName,
  roundTitle,
  currentStatus,
  currentResult,
  currentFeedback,
}: InterviewOutcomeModalProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [status, setStatus] = useState<InterviewStatus>(
    currentStatus === InterviewStatus.SCHEDULED ? InterviewStatus.COMPLETED : currentStatus
  )
  const [result, setResult] = useState<InterviewResult>(currentResult)
  const [feedback, setFeedback] = useState(currentFeedback || "")

  if (!isOpen) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const res = await updateInterview({
      id: interviewId,
      status,
      result,
      feedback: feedback.trim() || undefined,
    })

    if (!res.success) {
      setError(res.error || "Failed to update round outcome")
      setLoading(false)
      return
    }

    setLoading(false)
    onClose()
    router.refresh()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in-0 duration-150">
      <Card className="w-full max-w-md border-border/80 shadow-2xl relative">
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Award className="h-4 w-4 text-primary" />
            Update Round Outcome
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            {roundTitle} at {companyName}
          </p>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 pt-1">
            {error && (
              <div className="rounded-md bg-destructive/10 border border-destructive/20 p-2.5 text-xs text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Interview Result</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { val: InterviewResult.CLEARED, label: "Cleared Round", color: "hover:border-emerald-500 hover:bg-emerald-50/50" },
                  { val: InterviewResult.PENDING, label: "Awaiting Result", color: "hover:border-blue-500 hover:bg-blue-50/50" },
                  { val: InterviewResult.REJECTED, label: "Not Cleared", color: "hover:border-rose-500 hover:bg-rose-50/50" },
                  { val: InterviewResult.CANCELLED, label: "Cancelled", color: "hover:border-zinc-500 hover:bg-zinc-50/50" },
                ].map((item) => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => {
                      setResult(item.val)
                      if (item.val === InterviewResult.CLEARED || item.val === InterviewResult.REJECTED) {
                        setStatus(InterviewStatus.COMPLETED)
                      }
                    }}
                    className={`p-2 rounded-lg border text-xs font-medium text-center transition-all ${
                      result === item.val
                        ? "border-primary bg-primary/10 text-primary ring-1 ring-primary/20"
                        : `border-border text-foreground ${item.color}`
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Interview Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as InterviewStatus)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-2xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value={InterviewStatus.SCHEDULED}>Scheduled</option>
                <option value={InterviewStatus.COMPLETED}>Completed</option>
                <option value={InterviewStatus.RESCHEDULED}>Rescheduled</option>
                <option value={InterviewStatus.CANCELLED}>Cancelled</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Questions Asked & Self-Feedback
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={3}
                placeholder="What questions were asked? What went well and what should you review?"
                className="w-full rounded-md border border-input bg-background p-2.5 text-xs shadow-2xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
          </CardContent>

          <CardFooter className="flex justify-end gap-2 border-t pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={loading} className="gap-1.5">
              {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Save Outcome
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
