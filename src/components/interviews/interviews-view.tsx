"use client"

import { useState, useMemo } from "react"
import { InterviewType, InterviewStatus, InterviewResult } from "@prisma/client"
import { InterviewCard, InterviewWithApplication } from "@/components/interviews/interview-card"
import { InterviewModal } from "@/components/interviews/interview-modal"
import { INTERVIEW_TYPE_LABELS } from "@/components/interviews/interview-status-badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, Calendar, CheckCircle2, Clock, Sparkles } from "lucide-react"

interface ApplicationOption {
  id: string
  companyName: string
  roleTitle: string
}

interface InterviewsViewProps {
  initialInterviews: InterviewWithApplication[]
  applications: ApplicationOption[]
  preselectedApplicationId?: string
}

export function InterviewsView({
  initialInterviews,
  applications,
  preselectedApplicationId,
}: InterviewsViewProps) {
  const [isModalOpen, setIsModalOpen] = useState(!!preselectedApplicationId)
  const [tab, setTab] = useState<"upcoming" | "past" | "all">("upcoming")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState<string>("ALL")

  const now = new Date()

  const filteredInterviews = useMemo(() => {
    return initialInterviews.filter((item) => {
      const scheduled = new Date(item.scheduledAt)

      if (tab === "upcoming") {
        if (scheduled < now && item.status !== InterviewStatus.SCHEDULED) {
          return false
        }
      } else if (tab === "past") {
        if (scheduled >= now && item.status === InterviewStatus.SCHEDULED) {
          return false
        }
      }

      if (selectedType !== "ALL" && item.type !== selectedType) {
        return false
      }

      if (searchQuery.trim().length > 0) {
        const query = searchQuery.toLowerCase()
        const matchCompany = item.application.companyName.toLowerCase().includes(query)
        const matchRole = item.application.roleTitle.toLowerCase().includes(query)
        const matchRound = item.roundName?.toLowerCase().includes(query)
        const matchInterviewer = item.interviewerName?.toLowerCase().includes(query)
        return matchCompany || matchRole || matchRound || matchInterviewer
      }

      return true
    })
  }, [initialInterviews, tab, selectedType, searchQuery, now])

  const upcomingCount = initialInterviews.filter(
    (i) => new Date(i.scheduledAt) >= now && i.status === InterviewStatus.SCHEDULED
  ).length

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Interviews & Assessments
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage technical interviews, coding challenges, online assessments (OAs), and feedback.
          </p>
        </div>

        <Button
          onClick={() => setIsModalOpen(true)}
          size="sm"
          className="gap-1.5 shadow-2xs font-medium"
        >
          <Plus className="h-4 w-4" />
          Schedule Round / OA
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center rounded-lg border border-border bg-card p-0.5 shadow-2xs">
          <button
            type="button"
            onClick={() => setTab("upcoming")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              tab === "upcoming"
                ? "bg-primary text-primary-foreground shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            Upcoming ({upcomingCount})
          </button>
          <button
            type="button"
            onClick={() => setTab("past")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              tab === "past"
                ? "bg-primary text-primary-foreground shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Past & Completed
          </button>
          <button
            type="button"
            onClick={() => setTab("all")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              tab === "all"
                ? "bg-primary text-primary-foreground shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All ({initialInterviews.length})
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search company, role, interviewer..."
              className="pl-9 h-9 text-xs"
            />
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="rounded-md border border-input bg-card px-2.5 h-9 text-xs shadow-2xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="ALL">All Types</option>
            {Object.entries(INTERVIEW_TYPE_LABELS).map(([k, label]) => (
              <option key={k} value={k}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredInterviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/80 p-12 text-center bg-card/40">
          <div className="rounded-full bg-primary/10 p-3 text-primary mb-3">
            <Calendar className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-foreground">
            {tab === "upcoming" ? "No upcoming interviews" : "No interview rounds found"}
          </h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">
            {tab === "upcoming"
              ? "You have no upcoming tests or interviews scheduled. Keep applying and log assessments as you receive them!"
              : "No interview records match your filter criteria."}
          </p>
          <Button
            onClick={() => setIsModalOpen(true)}
            size="sm"
            className="mt-4 gap-1.5"
          >
            <Plus className="h-4 w-4" />
            Schedule Interview Round
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredInterviews.map((item) => (
            <InterviewCard key={item.id} interview={item} />
          ))}
        </div>
      )}

      <InterviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        applications={applications}
        preselectedApplicationId={preselectedApplicationId}
      />
    </div>
  )
}
