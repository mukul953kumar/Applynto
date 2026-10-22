"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { WorkMode } from "@prisma/client"
import { updateProfile } from "@/actions/profile"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  User,
  GraduationCap,
  Sparkles,
  Briefcase,
  FileText,
  Loader2,
  Check,
  X,
  IndianRupee,
  Trophy,
} from "lucide-react"

interface ResumeStat {
  version: string
  total: number
  interviews: number
  offers: number
}

interface ProfileFormProps {
  initialData: {
    name?: string | null
    email: string
    college?: string | null
    degree?: string | null
    branch?: string | null
    graduationYear?: number | null
    skills: string[]
    preferredRoles: string[]
    preferredWorkModes: WorkMode[]
    preferredLocations: string[]
    minimumStipend?: number | null
  }
  resumeStats: ResumeStat[]
}

const COMMON_SKILLS = [
  "React",
  "Next.js",
  "TypeScript",
  "JavaScript",
  "Node.js",
  "Python",
  "Java",
  "C++",
  "DSA",
  "SQL",
  "PostgreSQL",
  "MongoDB",
  "Docker",
  "Tailwind CSS",
  "Git",
]

const COMMON_ROLES = [
  "Software Development Engineer (SDE)",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Data Analyst",
  "Machine Learning Intern",
  "DevOps Engineer",
]

export function ProfileForm({ initialData, resumeStats }: ProfileFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState(initialData.name || "")
  const [college, setCollege] = useState(initialData.college || "")
  const [degree, setDegree] = useState(initialData.degree || "")
  const [branch, setBranch] = useState(initialData.branch || "")
  const [graduationYear, setGraduationYear] = useState(
    initialData.graduationYear ? String(initialData.graduationYear) : "2026"
  )
  const [minimumStipend, setMinimumStipend] = useState(
    initialData.minimumStipend ? String(initialData.minimumStipend) : ""
  )

  const [skills, setSkills] = useState<string[]>(initialData.skills || [])
  const [skillInput, setSkillInput] = useState("")

  const [preferredRoles, setPreferredRoles] = useState<string[]>(
    initialData.preferredRoles || []
  )
  const [roleInput, setRoleInput] = useState("")

  const [preferredWorkModes, setPreferredWorkModes] = useState<WorkMode[]>(
    initialData.preferredWorkModes || []
  )

  const [preferredLocations, setPreferredLocations] = useState<string[]>(
    initialData.preferredLocations || []
  )
  const [locationInput, setLocationInput] = useState("")

  function handleAddSkill(skillToAdd: string) {
    const trimmed = skillToAdd.trim()
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed])
    }
    setSkillInput("")
  }

  function handleRemoveSkill(skillToRemove: string) {
    setSkills(skills.filter((s) => s !== skillToRemove))
  }

  function handleAddRole(roleToAdd: string) {
    const trimmed = roleToAdd.trim()
    if (trimmed && !preferredRoles.includes(trimmed)) {
      setPreferredRoles([...preferredRoles, trimmed])
    }
    setRoleInput("")
  }

  function handleRemoveRole(roleToRemove: string) {
    setPreferredRoles(preferredRoles.filter((r) => r !== roleToRemove))
  }

  function toggleWorkMode(mode: WorkMode) {
    if (preferredWorkModes.includes(mode)) {
      setPreferredWorkModes(preferredWorkModes.filter((m) => m !== mode))
    } else {
      setPreferredWorkModes([...preferredWorkModes, mode])
    }
  }

  function handleAddLocation(locToAdd: string) {
    const trimmed = locToAdd.trim()
    if (trimmed && !preferredLocations.includes(trimmed)) {
      setPreferredLocations([...preferredLocations, trimmed])
    }
    setLocationInput("")
  }

  function handleRemoveLocation(locToRemove: string) {
    setPreferredLocations(preferredLocations.filter((l) => l !== locToRemove))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    const res = await updateProfile({
      name,
      college,
      degree,
      branch,
      graduationYear: graduationYear ? Number(graduationYear) : undefined,
      minimumStipend: minimumStipend ? Number(minimumStipend) : undefined,
      skills,
      preferredRoles,
      preferredWorkModes,
      preferredLocations,
    })

    setLoading(false)

    if (!res.success) {
      setError(res.error || "Failed to update profile")
      return
    }

    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-md bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
          <Check className="h-4 w-4" />
          Profile updated successfully! Match scores have been recalculated.
        </div>
      )}

      <Card className="border-border/80 shadow-2xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-primary" />
            Academic & Graduation Details
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Used to automatically verify batch eligibility and graduation year criteria for internship listings.
          </p>
        </CardHeader>
        <CardContent className="space-y-4 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Full Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Email Address</label>
              <Input
                value={initialData.email}
                disabled
                className="text-xs bg-muted/40 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">College / University</label>
              <Input
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                placeholder="e.g. Delhi Technological University or IIT Delhi"
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Graduation Year</label>
              <select
                value={graduationYear}
                onChange={(e) => setGraduationYear(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-2xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {[2024, 2025, 2026, 2027, 2028, 2029].map((year) => (
                  <option key={year} value={year}>
                    Class of {year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Degree Program</label>
              <Input
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                placeholder="e.g. B.Tech, BCA, MCA, B.Sc"
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Branch / Specialization</label>
              <Input
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="e.g. Computer Science, Information Technology, AI/ML"
                className="text-xs"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/80 shadow-2xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Skills & Technical Stack (Deterministic Matching)
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Our deterministic matching engine compares these skills with internship requirements to generate your match percentages.
          </p>
        </CardHeader>
        <CardContent className="space-y-4 pt-1">
          <div className="space-y-2">
            <label className="text-xs font-medium text-foreground">Your Skills</label>
            <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2 rounded-lg border bg-muted/20">
              {skills.length === 0 ? (
                <span className="text-xs text-muted-foreground italic">
                  No skills added yet. Add from suggestions or type below.
                </span>
              ) : (
                skills.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1 rounded-md bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 text-xs font-medium"
                  >
                    {s}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(s)}
                      className="hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))
              )}
            </div>

            <div className="flex gap-2">
              <Input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleAddSkill(skillInput)
                  }
                }}
                placeholder="Type a skill and press Enter (e.g. React, Python, Docker)..."
                className="text-xs"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleAddSkill(skillInput)}
              >
                Add
              </Button>
            </div>
          </div>

          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] font-medium text-muted-foreground">Popular Technical Skills:</span>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_SKILLS.map((item) => {
                const isAdded = skills.includes(item)
                return (
                  <button
                    key={item}
                    type="button"
                    disabled={isAdded}
                    onClick={() => handleAddSkill(item)}
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium border transition-colors ${
                      isAdded
                        ? "bg-muted text-muted-foreground/60 border-border cursor-default"
                        : "bg-card text-foreground border-border hover:border-primary/60 hover:bg-primary/5"
                    }`}
                  >
                    + {item}
                  </button>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/80 shadow-2xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-primary" />
            Roles, Work Modes & Stipend Expectations
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Fine-tune recommendations based on your desired positions, locations, and compensation.
          </p>
        </CardHeader>
        <CardContent className="space-y-4 pt-1">
          <div className="space-y-2">
            <label className="text-xs font-medium text-foreground">Preferred Roles</label>
            <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2 rounded-lg border bg-muted/20">
              {preferredRoles.length === 0 ? (
                <span className="text-xs text-muted-foreground italic">
                  No roles selected. We will match opportunities across all domains.
                </span>
              ) : (
                preferredRoles.map((r) => (
                  <span
                    key={r}
                    className="inline-flex items-center gap-1 rounded-md bg-secondary text-secondary-foreground border px-2 py-0.5 text-xs font-medium"
                  >
                    {r}
                    <button
                      type="button"
                      onClick={() => handleRemoveRole(r)}
                      className="hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))
              )}
            </div>

            <div className="flex gap-2">
              <Input
                value={roleInput}
                onChange={(e) => setRoleInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleAddRole(roleInput)
                  }
                }}
                placeholder="Type a target role title..."
                className="text-xs"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleAddRole(roleInput)}
              >
                Add
              </Button>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {COMMON_ROLES.map((r) => {
                const isAdded = preferredRoles.includes(r)
                return (
                  <button
                    key={r}
                    type="button"
                    disabled={isAdded}
                    onClick={() => handleAddRole(r)}
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium border transition-colors ${
                      isAdded
                        ? "bg-muted text-muted-foreground/60 border-border cursor-default"
                        : "bg-card text-foreground border-border hover:border-primary/60 hover:bg-primary/5"
                    }`}
                  >
                    + {r}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Preferred Work Modes</label>
              <div className="flex items-center gap-2">
                {[
                  { mode: WorkMode.REMOTE, label: "Remote" },
                  { mode: WorkMode.HYBRID, label: "Hybrid" },
                  { mode: WorkMode.ON_SITE, label: "In-Office" },
                ].map(({ mode, label }) => {
                  const isChecked = preferredWorkModes.includes(mode)
                  return (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => toggleWorkMode(mode)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                        isChecked
                          ? "bg-primary text-primary-foreground border-primary shadow-2xs"
                          : "bg-card text-muted-foreground border-border hover:bg-muted/50"
                      }`}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground flex items-center gap-1">
                <IndianRupee className="h-3 w-3" />
                Minimum Monthly Stipend (₹)
              </label>
              <Input
                type="number"
                value={minimumStipend}
                onChange={(e) => setMinimumStipend(e.target.value)}
                placeholder="e.g. 15000"
                min="0"
                step="1000"
                className="text-xs"
              />
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <label className="text-xs font-medium text-foreground">Preferred Job Locations</label>
            <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2 rounded-lg border bg-muted/20">
              {preferredLocations.length === 0 ? (
                <span className="text-xs text-muted-foreground italic">
                  Any location in India or Remote
                </span>
              ) : (
                preferredLocations.map((l) => (
                  <span
                    key={l}
                    className="inline-flex items-center gap-1 rounded-md bg-secondary text-secondary-foreground border px-2 py-0.5 text-xs font-medium"
                  >
                    {l}
                    <button
                      type="button"
                      onClick={() => handleRemoveLocation(l)}
                      className="hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))
              )}
            </div>

            <div className="flex gap-2">
              <Input
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleAddLocation(locationInput)
                  }
                }}
                placeholder="Add city (e.g. Bangalore, Hyderabad, Gurgaon, Remote)..."
                className="text-xs"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleAddLocation(locationInput)}
              >
                Add
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end border-t pt-3 pb-3">
          <Button type="submit" size="sm" disabled={loading} className="gap-1.5">
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Save Profile Preferences
          </Button>
        </CardFooter>
      </Card>

      {resumeStats.length > 0 && (
        <Card className="border-border/80 shadow-2xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Resume Version Performance & Labeling
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Compare callback and interview rates across different resume versions you have used.
            </p>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/40 border-b text-muted-foreground font-medium uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">Resume Version</th>
                    <th className="py-2.5 px-3">Applications Sent</th>
                    <th className="py-2.5 px-3">Interviews / OAs</th>
                    <th className="py-2.5 px-3">Offers</th>
                    <th className="py-2.5 px-3 text-right">Response Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {resumeStats.map((item) => {
                    const responseRate =
                      item.total > 0
                        ? Math.round(((item.interviews + item.offers) / item.total) * 100)
                        : 0

                    return (
                      <tr key={item.version} className="hover:bg-muted/30">
                        <td className="py-2.5 px-3 font-semibold text-foreground flex items-center gap-1.5">
                          <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                          {item.version}
                        </td>
                        <td className="py-2.5 px-3 text-muted-foreground">{item.total}</td>
                        <td className="py-2.5 px-3">
                          <span className="rounded bg-secondary px-1.5 py-0.5 font-medium text-secondary-foreground">
                            {item.interviews}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-medium px-1.5 py-0.5">
                            {item.offers}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-semibold text-primary">
                          {responseRate}%
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </form>
  )
}
