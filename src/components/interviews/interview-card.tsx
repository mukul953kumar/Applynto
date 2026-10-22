"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { InterviewStatus, InterviewResult, InterviewType } from "@prisma/client"
import { InterviewStatusBadge, INTERVIEW_TYPE_LABELS } from "@/components/interviews/interview-status-badge"
import { InterviewOutcomeModal } from "@/components/interviews/interview-outcome-modal"
import { deleteInterview } from "@/actions/interviews"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Calendar,
  Clock,
  ExternalLink,
  Trash2,
  Loader2,
  Video,
  User,
  CheckCircle2,
  FileText,
} from "lucide-react"

export type InterviewWithApplication = {
  id: string
  type: InterviewType
  roundName: string | null
  scheduledAt: Date
  timeZone: string
  durationMinutes: number | null
  meetingUrl: string | null
  interviewerName: string | null
  preparationNotes: string | null
  feedback: string | null
  result: InterviewResult
  status: InterviewStatus
  application: {
    id: string
    companyName: string
    roleTitle: string
    status: string
    jobUrl: string | null
  }
}

interface InterviewCardProps {
  interview: InterviewWithApplication
}

export function InterviewCard({ interview }: InterviewCardProps) {
  const router = useRouter()
  const [isOutcomeOpen, setIsOutcomeOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const scheduledDate = new Date(interview.scheduledAt)
  const now = new Date()
  const isPast = scheduledDate < now
  const diffHours = Math.round((scheduledDate.getTime() - now.getTime()) / (1000 * 60 * 60))

  let relativeTimeLabel = ""
  if (isPast) {
    const pastDays = Math.round((now.getTime() - scheduledDate.getTime()) / (1000 * 60 * 60 * 24))
    relativeTimeLabel = pastDays === 0 ? "Earlier today" : `${pastDays}d ago`
  } else {
    if (diffHours < 24 && scheduledDate.getDate() === now.getDate()) {
      relativeTimeLabel = "Today"
    } else if (diffHours < 48 && scheduledDate.getDate() === now.getDate() + 1) {
      relativeTimeLabel = "Tomorrow"
    } else {
      const days = Math.ceil(diffHours / 24)
      relativeTimeLabel = `In ${days} days`
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this interview record?")) {
      return
    }

    setDeleting(true)
    const res = await deleteInterview(interview.id)
    setDeleting(false)

    if (res.success) {
      router.refresh()
    } else {
      alert(res.error || "Failed to delete interview")
    }
  }

  return (
    <>
      <Card className="border-border/80 shadow-2xs hover:shadow-xs transition-shadow">
        <CardContent className="p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-border/60">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground">
                  {interview.roundName || INTERVIEW_TYPE_LABELS[interview.type]}
                </span>
                <InterviewStatusBadge status={interview.status} result={interview.result} />
              </div>
              <div className="pt-0.5">
                <Link
                  href={`/applications/${interview.application.id}`}
                  className="font-semibold text-foreground text-sm hover:text-primary transition-colors inline-block"
                >
                  {interview.application.roleTitle}
                </Link>
                <p className="text-xs text-muted-foreground font-medium">
                  {interview.application.companyName}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOutcomeOpen(true)}
                className="h-8 text-xs font-medium"
              >
                Log Outcome
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDelete}
                disabled={deleting}
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                title="Delete round"
              >
                {deleting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="flex items-start gap-2.5">
              <Calendar className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">
                  {scheduledDate.toLocaleDateString("en-IN", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
                <p className="text-muted-foreground text-[11px] flex items-center gap-1.5 mt-0.5">
                  <span>
                    {scheduledDate.toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <span>•</span>
                  <span className="font-medium text-primary">{relativeTimeLabel}</span>
                  {interview.durationMinutes && (
                    <>
                      <span>•</span>
                      <span>{interview.durationMinutes} mins</span>
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              {interview.meetingUrl ? (
                <div className="flex items-center gap-2">
                  <Video className="h-4 w-4 text-muted-foreground shrink-0" />
                  <a
                    href={interview.meetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-medium inline-flex items-center gap-1 text-xs truncate max-w-[200px]"
                  >
                    Join Call / Open Assessment
                    <ExternalLink className="h-3 w-3 shrink-0" />
                  </a>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground text-[11px]">
                  <Video className="h-4 w-4 shrink-0" />
                  <span>No meeting link entered</span>
                </div>
              )}

              {interview.interviewerName && (
                <div className="flex items-center gap-2 text-muted-foreground text-[11px]">
                  <User className="h-3.5 w-3.5 shrink-0" />
                  <span className="text-foreground">{interview.interviewerName}</span>
                </div>
              )}
            </div>
          </div>

          {(interview.preparationNotes || interview.feedback) && (
            <div className="pt-2 border-t border-border/40 space-y-2 text-xs">
              {interview.preparationNotes && (
                <div className="rounded-md bg-muted/40 p-2.5 border border-border/60">
                  <span className="font-semibold text-[11px] text-foreground flex items-center gap-1 mb-1">
                    <FileText className="h-3 w-3 text-muted-foreground" />
                    Preparation Notes
                  </span>
                  <p className="text-muted-foreground text-xs whitespace-pre-wrap">
                    {interview.preparationNotes}
                  </p>
                </div>
              )}

              {interview.feedback && (
                <div className="rounded-md bg-emerald-500/5 p-2.5 border border-emerald-500/20">
                  <span className="font-semibold text-[11px] text-emerald-700 dark:text-emerald-400 flex items-center gap-1 mb-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Candidate Feedback & Reflections
                  </span>
                  <p className="text-foreground/90 text-xs whitespace-pre-wrap">
                    {interview.feedback}
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <InterviewOutcomeModal
        isOpen={isOutcomeOpen}
        onClose={() => setIsOutcomeOpen(false)}
        interviewId={interview.id}
        companyName={interview.application.companyName}
        roundTitle={interview.roundName || INTERVIEW_TYPE_LABELS[interview.type]}
        currentStatus={interview.status}
        currentResult={interview.result}
        currentFeedback={interview.feedback}
      />
    </>
  )
}
