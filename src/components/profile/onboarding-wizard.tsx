"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { WorkMode } from "@prisma/client"
import { updateProfile } from "@/actions/profile"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  GraduationCap,
  Sparkles,
  Briefcase,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Check,
  X,
} from "lucide-react"

const POPULAR_SKILLS = [
  "React",
  "TypeScript",
  "Next.js",
  "Python",
  "Java",
  "DSA",
  "Node.js",
  "C++",
  "SQL",
  "Tailwind CSS",
  "Docker",
  "Git",
]

const POPULAR_ROLES = [
  "Software Development Engineer (SDE)",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Data Analyst",
  "DevOps Engineer",
]

export function OnboardingWizard() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [college, setCollege] = useState("")
  const [degree, setDegree] = useState("B.Tech")
  const [branch, setBranch] = useState("Computer Science & Engineering")
  const [graduationYear, setGraduationYear] = useState("2026")

  const [skills, setSkills] = useState<string[]>(["React", "JavaScript", "DSA"])
  const [skillInput, setSkillInput] = useState("")

  const [preferredRoles, setPreferredRoles] = useState<string[]>(["Software Development Engineer (SDE)"])
  const [roleInput, setRoleInput] = useState("")

  const [preferredWorkModes, setPreferredWorkModes] = useState<WorkMode[]>([
    WorkMode.REMOTE,
    WorkMode.HYBRID,
  ])
  const [minimumStipend, setMinimumStipend] = useState("15000")

  function handleAddSkill(skillToAdd: string) {
    const trimmed = skillToAdd.trim()
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed])
    }
    setSkillInput("")
  }

  function handleRemoveSkill(s: string) {
    setSkills(skills.filter((item) => item !== s))
  }

  function handleAddRole(roleToAdd: string) {
    const trimmed = roleToAdd.trim()
    if (trimmed && !preferredRoles.includes(trimmed)) {
      setPreferredRoles([...preferredRoles, trimmed])
    }
    setRoleInput("")
  }

  function handleRemoveRole(r: string) {
    setPreferredRoles(preferredRoles.filter((item) => item !== r))
  }

  function toggleWorkMode(mode: WorkMode) {
    if (preferredWorkModes.includes(mode)) {
      setPreferredWorkModes(preferredWorkModes.filter((m) => m !== mode))
    } else {
      setPreferredWorkModes([...preferredWorkModes, mode])
    }
  }

  async function handleFinish() {
    setLoading(true)
    setError(null)

    const res = await updateProfile({
      college,
      degree,
      branch,
      graduationYear: graduationYear ? Number(graduationYear) : undefined,
      skills,
      preferredRoles,
      preferredWorkModes,
      minimumStipend: minimumStipend ? Number(minimumStipend) : undefined,
    })

    if (!res.success) {
      setError(res.error || "Failed to save profile")
      setLoading(false)
      return
    }

    router.push("/dashboard")
    router.refresh()
  }

  return (
    <Card className="border-border/80 shadow-2xl max-w-2xl mx-auto">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <span>Step {step} of 3</span>
          <span className="font-medium text-primary">
            {step === 1 && "Academic Profile"}
            {step === 2 && "Skills & Tech Stack"}
            {step === 3 && "Job Preferences"}
          </span>
        </div>
        <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-primary h-full transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
        <CardTitle className="text-xl font-bold tracking-tight text-foreground pt-4">
          {step === 1 && "Tell us about your college & degree"}
          {step === 2 && "What are your top skills?"}
          {step === 3 && "What are your target roles & preferences?"}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 pt-1">
        {error && (
          <div className="rounded-md bg-destructive/10 border border-destructive/20 p-2.5 text-xs text-destructive">
            {error}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">College / University</label>
              <Input
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                placeholder="e.g. Delhi Technological University, NIT Trichy"
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Degree</label>
                <Input
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  placeholder="e.g. B.Tech, BCA, MCA"
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
                  {[2024, 2025, 2026, 2027, 2028, 2029].map((yr) => (
                    <option key={yr} value={yr}>
                      Class of {yr}
                    </option>
                  ))}
                </select>
              </div>
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
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground">Selected Skills</label>
              <div className="flex flex-wrap gap-1.5 min-h-[38px] p-2.5 rounded-lg border bg-muted/20">
                {skills.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1 rounded-md bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 text-xs font-medium"
                  >
                    {s}
                    <button type="button" onClick={() => handleRemoveSkill(s)}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
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
                  placeholder="Type a skill and press Enter..."
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
              <span className="text-[11px] font-medium text-muted-foreground">Quick Suggestions:</span>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_SKILLS.map((item) => {
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
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground">Target Roles</label>
              <div className="flex flex-wrap gap-1.5 min-h-[38px] p-2.5 rounded-lg border bg-muted/20">
                {preferredRoles.map((r) => (
                  <span
                    key={r}
                    className="inline-flex items-center gap-1 rounded-md bg-secondary text-secondary-foreground border px-2 py-0.5 text-xs font-medium"
                  >
                    {r}
                    <button type="button" onClick={() => handleRemoveRole(r)}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {POPULAR_ROLES.map((r) => {
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
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
                <label className="text-xs font-medium text-foreground">
                  Expected Monthly Stipend (₹)
                </label>
                <Input
                  type="number"
                  value={minimumStipend}
                  onChange={(e) => setMinimumStipend(e.target.value)}
                  placeholder="15000"
                  step="1000"
                  className="text-xs"
                />
              </div>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between border-t pt-4">
        {step > 1 ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setStep(step - 1)}
            disabled={loading}
            className="gap-1.5"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </Button>
        ) : (
          <div />
        )}

        {step < 3 ? (
          <Button
            type="button"
            size="sm"
            onClick={() => setStep(step + 1)}
            className="gap-1.5 font-medium"
          >
            Next
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        ) : (
          <Button
            type="button"
            size="sm"
            onClick={handleFinish}
            disabled={loading}
            className="gap-1.5 font-medium"
          >
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Complete Setup & Go to Dashboard
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
