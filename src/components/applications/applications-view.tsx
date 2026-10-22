"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { ApplicationStatus } from "@prisma/client"
import { ApplicationTable } from "@/components/applications/application-table"
import { ApplicationKanban } from "@/components/applications/application-kanban"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  LayoutGrid,
  List,
  Search,
  Plus,
  Briefcase,
  Trophy,
  CalendarCheck,
  Filter,
} from "lucide-react"

type ApplicationItem = {
  id: string
  companyName: string
  roleTitle: string
  jobUrl: string | null
  status: ApplicationStatus
  appliedAt: Date | null
  nextAction: string | null
  nextActionAt: Date | null
  resumeVersion: string | null
  recruiterName: string | null
  recruiterContact: string | null
  _count: {
    interviews: number
    reminders: number
  }
}

interface ApplicationsViewProps {
  initialApplications: ApplicationItem[]
}

export function ApplicationsView({ initialApplications }: ApplicationsViewProps) {
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL")

  const stats = useMemo(() => {
    const total = initialApplications.length
    const offers = initialApplications.filter((a) => a.status === ApplicationStatus.OFFER).length
    const activeInterviews = initialApplications.filter(
      (a) => a.status === ApplicationStatus.INTERVIEW || a.status === ApplicationStatus.ASSESSMENT
    ).length
    const applied = initialApplications.filter((a) => a.status === ApplicationStatus.APPLIED).length

    return { total, offers, activeInterviews, applied }
  }, [initialApplications])

  const filteredApplications = useMemo(() => {
    return initialApplications.filter((app) => {
      if (selectedStatus !== "ALL" && app.status !== selectedStatus) {
        return false
      }

      if (searchQuery.trim().length > 0) {
        const query = searchQuery.toLowerCase()
        const matchCompany = app.companyName.toLowerCase().includes(query)
        const matchRole = app.roleTitle.toLowerCase().includes(query)
        const matchAction = app.nextAction?.toLowerCase().includes(query)
        return matchCompany || matchRole || matchAction
      }

      return true
    })
  }, [initialApplications, selectedStatus, searchQuery])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Application Tracker</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Track your internship applications across all 8 pipeline stages from submission to offer.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center rounded-lg border border-border bg-card p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => setViewMode("kanban")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                viewMode === "kanban"
                  ? "bg-primary text-primary-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              Kanban
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                viewMode === "table"
                  ? "bg-primary text-primary-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <List className="h-3.5 w-3.5" />
              Table
            </button>
          </div>

          <Link
            href="/applications/new"
            className={buttonVariants({ size: "sm", className: "gap-1.5 font-medium shadow-2xs" })}
          >
            <Plus className="h-4 w-4" />
            Track Application
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl border border-border/80 bg-card p-3.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total Applications</span>
            <Briefcase className="h-4 w-4 text-primary" />
          </div>
          <p className="text-2xl font-bold text-foreground mt-1.5">{stats.total}</p>
        </div>

        <div className="rounded-xl border border-border/80 bg-card p-3.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Applied</span>
            <span className="h-2 w-2 rounded-full bg-blue-500" />
          </div>
          <p className="text-2xl font-bold text-foreground mt-1.5">{stats.applied}</p>
        </div>

        <div className="rounded-xl border border-border/80 bg-card p-3.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">OAs & Interviews</span>
            <CalendarCheck className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-foreground mt-1.5">{stats.activeInterviews}</p>
        </div>

        <div className="rounded-xl border border-border/80 bg-card p-3.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Offers Extended</span>
            <Trophy className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1.5">{stats.offers}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search company, role or action..."
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { value: "ALL", label: "All Stages" },
            { value: ApplicationStatus.SAVED, label: "Saved" },
            { value: ApplicationStatus.APPLIED, label: "Applied" },
            { value: ApplicationStatus.ASSESSMENT, label: "Assessment" },
            { value: ApplicationStatus.INTERVIEW, label: "Interview" },
            { value: ApplicationStatus.OFFER, label: "Offer" },
            { value: ApplicationStatus.REJECTED, label: "Rejected" },
          ].map((pill) => (
            <button
              key={pill.value}
              type="button"
              onClick={() => setSelectedStatus(pill.value)}
              className={`rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap transition-colors border ${
                selectedStatus === pill.value
                  ? "bg-primary text-primary-foreground border-primary shadow-2xs"
                  : "bg-card text-muted-foreground border-border hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {viewMode === "kanban" ? (
        <ApplicationKanban applications={filteredApplications} />
      ) : (
        <ApplicationTable applications={filteredApplications} />
      )}
    </div>
  )
}
