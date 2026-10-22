"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createApplication } from "@/actions/applications"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ApplicationStatus } from "@prisma/client"
import { ArrowLeft, Loader2 } from "lucide-react"

interface ApplicationFormProps {
  initialValues?: {
    internshipId?: string
    companyName?: string
    roleTitle?: string
    jobUrl?: string
    source?: string
  }
}

export function ApplicationForm({ initialValues }: ApplicationFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [companyName, setCompanyName] = useState(initialValues?.companyName || "")
  const [roleTitle, setRoleTitle] = useState(initialValues?.roleTitle || "")
  const [jobUrl, setJobUrl] = useState(initialValues?.jobUrl || "")
  const [source, setSource] = useState(initialValues?.source || "Applynto Listing")
  const [status, setStatus] = useState<ApplicationStatus>(
    initialValues?.internshipId ? ApplicationStatus.APPLIED : ApplicationStatus.APPLIED
  )
  const [appliedAt, setAppliedAt] = useState(new Date().toISOString().split("T")[0])
  const [resumeVersion, setResumeVersion] = useState("")
  const [recruiterName, setRecruiterName] = useState("")
  const [recruiterContact, setRecruiterContact] = useState("")
  const [nextAction, setNextAction] = useState("")
  const [nextActionAt, setNextActionAt] = useState("")
  const [notes, setNotes] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const res = await createApplication({
      internshipId: initialValues?.internshipId,
      companyName,
      roleTitle,
      jobUrl: jobUrl || undefined,
      source: source || undefined,
      status,
      appliedAt: appliedAt || undefined,
      resumeVersion: resumeVersion || undefined,
      recruiterName: recruiterName || undefined,
      recruiterContact: recruiterContact || undefined,
      nextAction: nextAction || undefined,
      nextActionAt: nextActionAt || undefined,
      notes: notes || undefined,
    })

    if (!res.success) {
      setError(res.error || "Failed to save application")
      setLoading(false)
      return
    }

    router.push("/applications")
    router.refresh()
  }

  return (
    <Card className="max-w-3xl border-border/80 shadow-2xs">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          {initialValues?.internshipId ? "Track Listing Application" : "Log External Application"}
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive font-medium">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium" htmlFor="role">
                Role / Title *
              </label>
              <Input
                id="role"
                required
                placeholder="e.g. SDE Intern"
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium" htmlFor="company">
                Company Name *
              </label>
              <Input
                id="company"
                required
                placeholder="e.g. Google"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium" htmlFor="status">
                Current Stage *
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value={ApplicationStatus.SAVED}>Saved for later</option>
                <option value={ApplicationStatus.APPLIED}>Applied</option>
                <option value={ApplicationStatus.ASSESSMENT}>Online Assessment</option>
                <option value={ApplicationStatus.INTERVIEW}>Interview Scheduled</option>
                <option value={ApplicationStatus.OFFER}>Offer Received</option>
                <option value={ApplicationStatus.REJECTED}>Rejected</option>
                <option value={ApplicationStatus.WITHDRAWN}>Withdrawn</option>
                <option value={ApplicationStatus.ON_HOLD}>On Hold</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium" htmlFor="appliedAt">
                Application Date
              </label>
              <Input
                id="appliedAt"
                type="date"
                value={appliedAt}
                onChange={(e) => setAppliedAt(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium" htmlFor="source">
                Source
              </label>
              <select
                id="source"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="Applynto Listing">Applynto Listing</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="Company Careers Portal">Company Careers Portal</option>
                <option value="Campus Placement">Campus Placement</option>
                <option value="Employee Referral">Employee Referral</option>
                <option value="Naukri / Indeed">Naukri / Indeed</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium" htmlFor="jobUrl">
                Official Job URL (optional)
              </label>
              <Input
                id="jobUrl"
                type="url"
                placeholder="https://company.com/jobs/123"
                value={jobUrl}
                onChange={(e) => setJobUrl(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium" htmlFor="resumeVersion">
                Resume Version Used (optional)
              </label>
              <Input
                id="resumeVersion"
                placeholder="e.g. SDE Resume v2 / Frontend focused"
                value={resumeVersion}
                onChange={(e) => setResumeVersion(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="space-y-1.5">
              <label className="text-xs font-medium" htmlFor="recruiter">
                Recruiter Name (optional)
              </label>
              <Input
                id="recruiter"
                placeholder="e.g. Priya Sharma"
                value={recruiterName}
                onChange={(e) => setRecruiterName(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium" htmlFor="contact">
                Recruiter Email / LinkedIn (optional)
              </label>
              <Input
                id="contact"
                placeholder="e.g. recruiter@company.com"
                value={recruiterContact}
                onChange={(e) => setRecruiterContact(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="space-y-1.5">
              <label className="text-xs font-medium" htmlFor="nextAction">
                Next Action / Follow-up (optional)
              </label>
              <Input
                id="nextAction"
                placeholder="e.g. Complete HackerEarth assessment"
                value={nextAction}
                onChange={(e) => setNextAction(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium" htmlFor="nextActionAt">
                Target Date for Next Action
              </label>
              <Input
                id="nextActionAt"
                type="date"
                value={nextActionAt}
                onChange={(e) => setNextActionAt(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-1.5 pt-1">
            <label className="text-xs font-medium" htmlFor="notes">
              Personal Notes & Application Thoughts (optional)
            </label>
            <textarea
              id="notes"
              rows={3}
              placeholder="Record referral code, questions asked in form, or salary expectations discussed..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={loading}
              className="w-full rounded-md border border-input bg-background p-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </CardContent>

        <CardFooter className="flex items-center justify-between border-t border-border/60 pt-4">
          <Link
            href="/applications"
            className={buttonVariants({ variant: "ghost", size: "sm", className: "gap-1.5 text-xs" })}
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Cancel
          </Link>

          <Button type="submit" size="sm" disabled={loading} className="text-xs">
            {loading ? (
              <span className="flex items-center gap-1.5">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving...
              </span>
            ) : (
              "Save Application"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
