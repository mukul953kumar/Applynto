"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createAdminInternship } from "@/actions/admin-internships"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { WorkMode } from "@prisma/client"
import { ArrowLeft, Loader2 } from "lucide-react"

export function NewListingForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [companyWebsite, setCompanyWebsite] = useState("")
  const [location, setLocation] = useState("")
  const [workMode, setWorkMode] = useState<WorkMode>(WorkMode.REMOTE)
  const [stipendMin, setStipendMin] = useState("")
  const [stipendMax, setStipendMax] = useState("")
  const [deadline, setDeadline] = useState("")
  const [officialApplyUrl, setOfficialApplyUrl] = useState("")
  const [requiredSkills, setRequiredSkills] = useState("")
  const [shortDescription, setShortDescription] = useState("")
  const [description, setDescription] = useState("")
  const [responsibilities, setResponsibilities] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const skillsArray = requiredSkills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)

    if (skillsArray.length === 0) {
      setError("Please specify at least one required skill")
      setLoading(false)
      return
    }

    if (!officialApplyUrl.startsWith("https://")) {
      setError("Official Application URL must begin with https://")
      setLoading(false)
      return
    }

    const res = await createAdminInternship({
      title,
      companyName,
      companyWebsite: companyWebsite || undefined,
      location: location || undefined,
      workMode,
      stipendMin: stipendMin ? parseInt(stipendMin, 10) : undefined,
      stipendMax: stipendMax ? parseInt(stipendMax, 10) : undefined,
      currency: "INR",
      deadline: deadline || undefined,
      officialApplyUrl,
      requiredSkills: skillsArray,
      preferredSkills: [],
      eligibleDegrees: [],
      eligibleBranches: [],
      eligibleGraduationYears: [],
      shortDescription,
      description,
      responsibilities: responsibilities || undefined,
      status: "PUBLISHED" as any,
      verificationStatus: "VERIFIED" as any,
      sourceType: "ADMIN_FORM" as any,
    })

    if (!res.success) {
      setError(res.error || "Failed to create listing")
      setLoading(false)
      return
    }

    router.push("/admin/internships")
    router.refresh()
  }

  return (
    <Card className="max-w-3xl border-border/80 shadow-2xs">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Create Internship Listing</CardTitle>
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
              <label className="text-xs font-medium" htmlFor="title">
                Role Title *
              </label>
              <Input
                id="title"
                required
                placeholder="e.g. Software Engineering Intern"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
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
                placeholder="e.g. Razorpay"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium" htmlFor="workMode">
                Work Mode
              </label>
              <select
                id="workMode"
                value={workMode}
                onChange={(e) => setWorkMode(e.target.value as WorkMode)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value={WorkMode.REMOTE}>Remote</option>
                <option value={WorkMode.HYBRID}>Hybrid</option>
                <option value={WorkMode.ON_SITE}>On-site</option>
                <option value={WorkMode.NOT_SPECIFIED}>Not specified</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium" htmlFor="location">
                Location
              </label>
              <Input
                id="location"
                placeholder="e.g. Bengaluru / India"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium" htmlFor="website">
                Company Website
              </label>
              <Input
                id="website"
                type="url"
                placeholder="https://company.com"
                value={companyWebsite}
                onChange={(e) => setCompanyWebsite(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium" htmlFor="stipendMin">
                Min Stipend (INR/mo)
              </label>
              <Input
                id="stipendMin"
                type="number"
                placeholder="25000"
                value={stipendMin}
                onChange={(e) => setStipendMin(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium" htmlFor="stipendMax">
                Max Stipend (INR/mo)
              </label>
              <Input
                id="stipendMax"
                type="number"
                placeholder="35000"
                value={stipendMax}
                onChange={(e) => setStipendMax(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium" htmlFor="deadline">
                Application Deadline
              </label>
              <Input
                id="deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium" htmlFor="applyUrl">
              Official Application URL (HTTPS) *
            </label>
            <Input
              id="applyUrl"
              type="url"
              required
              placeholder="https://careers.company.com/jobs/123"
              value={officialApplyUrl}
              onChange={(e) => setOfficialApplyUrl(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium" htmlFor="skills">
              Required Skills (comma-separated) *
            </label>
            <Input
              id="skills"
              required
              placeholder="React, TypeScript, Node.js, SQL"
              value={requiredSkills}
              onChange={(e) => setRequiredSkills(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium" htmlFor="shortDesc">
              Short Summary (1-2 sentences) *
            </label>
            <Input
              id="shortDesc"
              required
              placeholder="Join our engineering team to build scalable student tools."
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium" htmlFor="desc">
              Detailed Role Description *
            </label>
            <textarea
              id="desc"
              required
              rows={4}
              placeholder="Provide full job context, background, and candidate expectations..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
              className="w-full rounded-md border border-input bg-background p-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium" htmlFor="resp">
              Key Responsibilities (optional)
            </label>
            <textarea
              id="resp"
              rows={3}
              placeholder="- Build reusable components&#10;- Collaborate with designers and backend teams"
              value={responsibilities}
              onChange={(e) => setResponsibilities(e.target.value)}
              disabled={loading}
              className="w-full rounded-md border border-input bg-background p-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </CardContent>

        <CardFooter className="flex items-center justify-between border-t border-border/60 pt-4">
          <Link
            href="/admin/internships"
            className={buttonVariants({ variant: "ghost", size: "sm", className: "gap-1.5 text-xs" })}
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Cancel
          </Link>

          <Button type="submit" size="sm" disabled={loading} className="text-xs">
            {loading ? (
              <span className="flex items-center gap-1.5">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Publishing...
              </span>
            ) : (
              "Publish Verified Listing"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
