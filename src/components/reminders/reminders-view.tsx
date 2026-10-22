"use client"

import { useState, useMemo } from "react"
import { Priority, ReminderStatus } from "@prisma/client"
import { ReminderItem, ReminderWithApplication } from "@/components/reminders/reminder-item"
import { ReminderDialog } from "@/components/reminders/reminder-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Bell,
  Plus,
  Search,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
} from "lucide-react"

interface ApplicationOption {
  id: string
  companyName: string
  roleTitle: string
}

interface RemindersViewProps {
  initialReminders: ReminderWithApplication[]
  applications: ApplicationOption[]
  preselectedApplicationId?: string
}

export function RemindersView({
  initialReminders,
  applications,
  preselectedApplicationId,
}: RemindersViewProps) {
  const [isModalOpen, setIsModalOpen] = useState(!!preselectedApplicationId)
  const [tab, setTab] = useState<"pending" | "completed" | "all">("pending")
  const [searchQuery, setSearchQuery] = useState("")
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL")

  const now = new Date()

  const filteredReminders = useMemo(() => {
    return initialReminders.filter((rem) => {
      if (tab === "pending" && rem.status === ReminderStatus.COMPLETED) {
        return false
      }
      if (tab === "completed" && rem.status !== ReminderStatus.COMPLETED) {
        return false
      }

      if (priorityFilter !== "ALL" && rem.priority !== priorityFilter) {
        return false
      }

      if (searchQuery.trim().length > 0) {
        const query = searchQuery.toLowerCase()
        const matchTitle = rem.title.toLowerCase().includes(query)
        const matchDesc = rem.description?.toLowerCase().includes(query)
        const matchApp =
          rem.application?.companyName.toLowerCase().includes(query) ||
          rem.application?.roleTitle.toLowerCase().includes(query)
        return matchTitle || matchDesc || matchApp
      }

      return true
    })
  }, [initialReminders, tab, priorityFilter, searchQuery])

  const overdueList = useMemo(() => {
    return filteredReminders.filter(
      (r) => r.status !== ReminderStatus.COMPLETED && new Date(r.dueAt) < now
    )
  }, [filteredReminders, now])

  const upcomingList = useMemo(() => {
    return filteredReminders.filter(
      (r) => r.status !== ReminderStatus.COMPLETED && new Date(r.dueAt) >= now
    )
  }, [filteredReminders, now])

  const completedList = useMemo(() => {
    return filteredReminders.filter((r) => r.status === ReminderStatus.COMPLETED)
  }, [filteredReminders])

  const pendingCount = initialReminders.filter(
    (r) => r.status !== ReminderStatus.COMPLETED
  ).length

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Reminders & Tasks</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Keep track of follow-ups, take-home challenge deadlines, and interview preparations.
          </p>
        </div>

        <Button
          onClick={() => setIsModalOpen(true)}
          size="sm"
          className="gap-1.5 shadow-2xs font-medium"
        >
          <Plus className="h-4 w-4" />
          Add Reminder
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center rounded-lg border border-border bg-card p-0.5 shadow-2xs">
          <button
            type="button"
            onClick={() => setTab("pending")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              tab === "pending"
                ? "bg-primary text-primary-foreground shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            Pending ({pendingCount})
          </button>
          <button
            type="button"
            onClick={() => setTab("completed")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              tab === "completed"
                ? "bg-primary text-primary-foreground shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Completed
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
            All ({initialReminders.length})
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reminders or companies..."
              className="pl-9 h-9 text-xs"
            />
          </div>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="rounded-md border border-input bg-card px-2.5 h-9 text-xs shadow-2xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="ALL">All Priorities</option>
            <option value={Priority.URGENT}>Urgent</option>
            <option value={Priority.HIGH}>High</option>
            <option value={Priority.MEDIUM}>Medium</option>
            <option value={Priority.LOW}>Low</option>
          </select>
        </div>
      </div>

      {tab === "pending" ? (
        <div className="space-y-6">
          {overdueList.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                <AlertTriangle className="h-4 w-4" />
                <h3 className="text-xs font-bold uppercase tracking-wider">
                  Overdue Actions ({overdueList.length})
                </h3>
              </div>
              <div className="space-y-2.5">
                {overdueList.map((rem) => (
                  <ReminderItem key={rem.id} reminder={rem} />
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3">
            {overdueList.length > 0 && upcomingList.length > 0 && (
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground pt-2">
                Upcoming Due Dates ({upcomingList.length})
              </h3>
            )}
            {upcomingList.length > 0 ? (
              <div className="space-y-2.5">
                {upcomingList.map((rem) => (
                  <ReminderItem key={rem.id} reminder={rem} />
                ))}
              </div>
            ) : overdueList.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/80 p-12 text-center bg-card/40">
                <div className="rounded-full bg-primary/10 p-3 text-primary mb-3">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="text-base font-semibold text-foreground">You are all caught up!</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                  No pending reminders or overdue tasks. Set follow-ups to stay proactive on your applications.
                </p>
                <Button
                  onClick={() => setIsModalOpen(true)}
                  size="sm"
                  className="mt-4 gap-1.5"
                >
                  <Plus className="h-4 w-4" />
                  Create Reminder
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      ) : tab === "completed" ? (
        <div className="space-y-2.5">
          {completedList.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/80 p-12 text-center bg-card/40">
              <p className="text-xs text-muted-foreground">No completed tasks yet.</p>
            </div>
          ) : (
            completedList.map((rem) => <ReminderItem key={rem.id} reminder={rem} />)
          )}
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredReminders.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/80 p-12 text-center bg-card/40">
              <p className="text-xs text-muted-foreground">No reminders found.</p>
            </div>
          ) : (
            filteredReminders.map((rem) => <ReminderItem key={rem.id} reminder={rem} />)
          )}
        </div>
      )}

      <ReminderDialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        applications={applications}
        preselectedApplicationId={preselectedApplicationId}
      />
    </div>
  )
}
