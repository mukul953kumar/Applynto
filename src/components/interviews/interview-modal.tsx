"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { InterviewType } from "@prisma/client"
import { createInterview } from "@/actions/interviews"
import { INTERVIEW_TYPE_LABELS } from "@/components/interviews/interview-status-badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, X, Calendar, Video, Clock } from "lucide-react"

interface ApplicationOption {
  id: string
  companyName: string
  roleTitle: string
}

interface InterviewModalProps {
  isOpen: boolean
  onClose: () => void
  applications: ApplicationOption[]
  preselectedApplicationId?: string
}

export function InterviewModal({
  isOpen,
  onClose,
  applications,
  preselectedApplicationId,
}: InterviewModalProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [applicationId, setApplicationId] = useState(
    preselectedApplicationId || applications[0]?.id || ""
  )
  const [type, setType] = useState<InterviewType>(InterviewType.TECHNICAL_INTERVIEW)
  const [roundName, setRoundName] = useState("")
  const [scheduledAt, setScheduledAt] = useState("")
  const [durationMinutes, setDurationMinutes] = useState("45")
  const [meetingUrl, setMeetingUrl] = useState("")
  const [interviewerName, setInterviewerName] = useState("")
  const [preparationNotes, setPreparationNotes] = useState("")

  if (!isOpen) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!applicationId) {
      setError("Please select an application to link this round to")
      return
    }

    if (!scheduledAt) {
      setError("Please choose the scheduled date and time")
      return
    }

    setError(null)
    setLoading(true)

    const res = await createInterview({
      applicationId,
      type,
      roundName: roundName.trim() || undefined,
      scheduledAt: new Date(scheduledAt).toISOString(),
      durationMinutes: durationMinutes ? Number(durationMinutes) : undefined,
      meetingUrl: meetingUrl.trim() || undefined,
      interviewerName: interviewerName.trim() || undefined,
      preparationNotes: preparationNotes.trim() || undefined,
    })

    if (!res.success) {
      setError(res.error || "Failed to schedule interview")
      setLoading(false)
      return
    }

    setLoading(false)
    onClose()
    router.refresh()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in-0 duration-150">
      <Card className="w-full max-w-lg border-border/80 shadow-2xl relative max-h-[90vh] flex flex-col">
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <CardHeader className="pb-3 shrink-0">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            Schedule Interview or Assessment
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Log an upcoming OA, technical discussion, coding round, or HR interview.
          </p>
        </CardHeader>

        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 p-2.5 text-xs text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Application <span className="text-destructive">*</span>
            </label>
            <select
              value={applicationId}
              onChange={(e) => setApplicationId(e.target.value)}
              required
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-2xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {applications.length === 0 ? (
                <option value="">No applications found. Please track an application first.</option>
              ) : (
                applications.map((app) => (
                  <option key={app.id} value={app.id}>
                    {app.companyName} — {app.roleTitle}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Round Type <span className="text-destructive">*</span>
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as InterviewType)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-2xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {Object.entries(INTERVIEW_TYPE_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Round Label <span className="text-muted-foreground font-normal">(Optional)</span>
              </label>
              <Input
                value={roundName}
                onChange={(e) => setRoundName(e.target.value)}
                placeholder="e.g. Round 1 DSA or OA HackerRank"
                className="text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Date & Time (IST) <span className="text-destructive">*</span>
              </label>
              <Input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                required
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Duration (minutes)
              </label>
              <Input
                type="number"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                placeholder="45"
                min="1"
                className="text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
              <Video className="h-3 w-3 text-muted-foreground" />
              Meeting Link or Test URL
            </label>
            <Input
              type="url"
              value={meetingUrl}
              onChange={(e) => setMeetingUrl(e.target.value)}
              placeholder="https://meet.google.com/... or HackerRank link"
              className="text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Interviewer Name / Title
            </label>
            <Input
              value={interviewerName}
              onChange={(e) => setInterviewerName(e.target.value)}
              placeholder="e.g., Jane Doe (Senior SDE)"
              className="text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Preparation Notes & Focus Topics
            </label>
            <textarea
              value={preparationNotes}
              onChange={(e) => setPreparationNotes(e.target.value)}
              rows={3}
              placeholder="Topics to revise: Dynamic Programming, Graph Traversal, Low-Level Design..."
              className="w-full rounded-md border border-input bg-background p-2.5 text-xs shadow-2xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          <CardFooter className="px-0 pt-3 pb-2 flex justify-end gap-2 border-t">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={loading || applications.length === 0}
              className="gap-1.5"
            >
              {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Schedule Round
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
