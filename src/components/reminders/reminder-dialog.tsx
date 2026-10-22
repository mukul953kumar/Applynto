"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Priority, ReminderType } from "@prisma/client"
import { createReminder } from "@/actions/reminders"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Bell, Loader2, X } from "lucide-react"

interface ApplicationOption {
  id: string
  companyName: string
  roleTitle: string
}

interface ReminderDialogProps {
  isOpen: boolean
  onClose: () => void
  applications: ApplicationOption[]
  preselectedApplicationId?: string
}

export function ReminderDialog({
  isOpen,
  onClose,
  applications,
  preselectedApplicationId,
}: ReminderDialogProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [applicationId, setApplicationId] = useState(preselectedApplicationId || "")
  const [type, setType] = useState<ReminderType>(ReminderType.APPLICATION_FOLLOW_UP)
  const [priority, setPriority] = useState<Priority>(Priority.MEDIUM)
  const [dueAt, setDueAt] = useState("")

  if (!isOpen) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) {
      setError("Please enter a reminder title")
      return
    }

    if (!dueAt) {
      setError("Please select the due date and time")
      return
    }

    setError(null)
    setLoading(true)

    const res = await createReminder({
      title,
      description: description.trim() || undefined,
      applicationId: applicationId || undefined,
      type,
      priority,
      dueAt: new Date(dueAt).toISOString(),
    })

    if (!res.success) {
      setError(res.error || "Failed to create reminder")
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
            <Bell className="h-4 w-4 text-primary" />
            Set New Reminder
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Never miss an application deadline, interview prep slot, or follow-up email.
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
              <label className="text-xs font-medium text-foreground">
                Reminder Title <span className="text-destructive">*</span>
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Follow up on SWE Intern OA submission"
                required
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Due Date & Time (IST) <span className="text-destructive">*</span>
              </label>
              <Input
                type="datetime-local"
                value={dueAt}
                onChange={(e) => setDueAt(e.target.value)}
                required
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-2xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value={Priority.LOW}>Low</option>
                  <option value={Priority.MEDIUM}>Medium</option>
                  <option value={Priority.HIGH}>High</option>
                  <option value={Priority.URGENT}>Urgent</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Category</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as ReminderType)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-2xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value={ReminderType.APPLICATION_FOLLOW_UP}>Follow-up</option>
                  <option value={ReminderType.ASSESSMENT_DEADLINE}>OA Deadline</option>
                  <option value={ReminderType.INTERVIEW_PREPARATION}>Prep Revision</option>
                  <option value={ReminderType.INTERVIEW_DATE}>Interview Date</option>
                  <option value={ReminderType.RECRUITER_CONTACT}>Contact Recruiter</option>
                  <option value={ReminderType.CUSTOM}>General Note</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Link to Application <span className="text-muted-foreground font-normal">(Optional)</span>
              </label>
              <select
                value={applicationId}
                onChange={(e) => setApplicationId(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-2xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">None (General reminder)</option>
                {applications.map((app) => (
                  <option key={app.id} value={app.id}>
                    {app.companyName} — {app.roleTitle}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Notes / Details <span className="text-muted-foreground font-normal">(Optional)</span>
              </label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Details or email subject reference"
                className="text-xs"
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
              Set Reminder
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
