import { notFound } from "next/navigation"
import Link from "next/link"
import { getInternshipById } from "@/actions/internships"
import { SaveButton } from "@/components/internships/save-button"
import { ReportModal } from "@/components/internships/report-modal"
import { PublicHeader } from "@/components/layout/public-header"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertTriangle,
  ArrowLeft,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  GraduationCap,
  Layers,
  MapPin,
  ShieldCheck,
} from "lucide-react"

export const dynamic = "force-dynamic"

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params
  const internship = await getInternshipById(id)
  if (!internship) return { title: "Internship Not Found | Applynto" }

  return {
    title: `${internship.title} at ${internship.companyName} | Applynto`,
    description: internship.shortDescription,
  }
}

export default async function InternshipDetailPage({ params }: PageProps) {
  const { id } = await params
  const internship = await getInternshipById(id)

  if (!internship) {
    notFound()
  }

  const { stipendMin, stipendMax, deadline } = internship

  function formatStipend() {
    if (stipendMin && stipendMax) {
      if (stipendMin === stipendMax) {
        return `₹${stipendMin.toLocaleString("en-IN")} / month`
      }
      return `₹${stipendMin.toLocaleString("en-IN")} - ₹${stipendMax.toLocaleString("en-IN")} / month`
    }
    if (stipendMin) {
      return `From ₹${stipendMin.toLocaleString("en-IN")} / month`
    }
    return "Not specified"
  }

  function formatDeadline() {
    if (!deadline) return "Rolling admission"
    return new Date(deadline).toLocaleDateString("en-IN", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  }

  const workModeLabels: Record<string, string> = {
    REMOTE: "Remote",
    HYBRID: "Hybrid",
    ON_SITE: "On-site",
    NOT_SPECIFIED: "Not specified",
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <PublicHeader />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 md:px-8 py-6 md:py-8 space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/internships"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to all internships</span>
          </Link>

          <ReportModal internshipId={internship.id} internshipTitle={internship.title} />
        </div>

        {internship.isExpired && (
          <div className="flex items-center gap-3 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-xs text-destructive">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold text-sm">This opportunity has expired</p>
              <p className="text-destructive/90 mt-0.5">
                The application deadline ({formatDeadline()}) has passed. You can still view the details for reference or keep it in your application history.
              </p>
            </div>
          </div>
        )}

        <div className="bg-card border border-border/80 rounded-lg p-6 md:p-8 space-y-6 shadow-2xs">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 pb-6 border-b border-border/60">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-muted border border-border text-base font-bold text-foreground">
                {internship.companyName.slice(0, 2).toUpperCase()}
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">{internship.companyName}</span>
                  {internship.companyWebsite && (
                    <a
                      href={internship.companyWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline inline-flex items-center gap-0.5"
                    >
                      <span>Website</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  {internship.verificationStatus === "VERIFIED" && (
                    <Badge variant="secondary" className="gap-1 text-[11px] text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                      <CheckCircle2 className="h-3 w-3" /> Verified Listing
                    </Badge>
                  )}
                </div>

                <h1 className="text-2xl font-bold tracking-tight text-foreground">{internship.title}</h1>

                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-1">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {internship.location || "Location not specified"}
                  </span>
                  <span>•</span>
                  <span>{workModeLabels[internship.workMode] || internship.workMode}</span>
                  {internship.duration && (
                    <>
                      <span>•</span>
                      <span>{internship.duration}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-row md:flex-col items-center md:items-end gap-3 shrink-0">
              <div className="flex items-center gap-2 w-full md:w-auto">
                <SaveButton
                  internshipId={internship.id}
                  initialSaved={internship.isSaved}
                  size="default"
                  showText
                  className="h-10 px-4 text-xs"
                />

                <a
                  href={internship.officialApplyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonVariants({
                    size: "default",
                    className: "h-10 px-5 text-xs gap-1.5 font-medium",
                  })}
                >
                  <span>Apply on Company Site</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>

              {internship.existingApplicationId ? (
                <Link
                  href={`/applications/${internship.existingApplicationId}`}
                  className="text-xs text-primary font-medium hover:underline inline-flex items-center gap-1"
                >
                  <Layers className="h-3.5 w-3.5" />
                  <span>Already in your tracker (View)</span>
                </Link>
              ) : (
                <Link
                  href={`/applications/new?internshipId=${internship.id}`}
                  className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 underline-offset-4 hover:underline"
                >
                  <Briefcase className="h-3.5 w-3.5" />
                  <span>Track this application in your pipeline</span>
                </Link>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-3 px-4 rounded-lg bg-muted/40 border border-border/60">
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase">Stipend</p>
              <p className="text-sm font-semibold text-foreground mt-0.5">{formatStipend()}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase">Deadline</p>
              <p className="text-sm font-semibold text-foreground mt-0.5">{formatDeadline()}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase">Work Mode</p>
              <p className="text-sm font-semibold text-foreground mt-0.5">
                {workModeLabels[internship.workMode] || internship.workMode}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase">Source</p>
              <p className="text-sm font-semibold text-foreground mt-0.5">
                {internship.sourceType === "ADMIN_FORM" ? "Direct / Verified" : "Imported"}
              </p>
            </div>
          </div>

          <div className="space-y-6 pt-2">
            <div>
              <h2 className="text-base font-semibold mb-2">About the Role</h2>
              <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                {internship.description}
              </p>
            </div>

            {internship.responsibilities && (
              <div>
                <h2 className="text-base font-semibold mb-2">Key Responsibilities</h2>
                <div className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                  {internship.responsibilities}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-3">
                <h2 className="text-base font-semibold">Skills & Competencies</h2>
                <div>
                  <p className="text-xs font-medium text-foreground mb-1.5">Required Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {internship.requiredSkills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary border border-primary/20"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {internship.preferredSkills && internship.preferredSkills.length > 0 && (
                  <div className="pt-2">
                    <p className="text-xs font-medium text-foreground mb-1.5">Preferred / Nice-to-have</p>
                    <div className="flex flex-wrap gap-1.5">
                      {internship.preferredSkills.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-muted text-muted-foreground"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <h2 className="text-base font-semibold">Eligibility Criteria</h2>

                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-2">
                    <GraduationCap className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium text-foreground">Eligible Degrees: </span>
                      <span className="text-muted-foreground">
                        {internship.eligibleDegrees.length > 0
                          ? internship.eligibleDegrees.join(", ")
                          : "Open to all relevant degrees"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium text-foreground">Graduation Batches: </span>
                      <span className="text-muted-foreground">
                        {internship.eligibleGraduationYears.length > 0
                          ? internship.eligibleGraduationYears.join(", ")
                          : "All passing-out batches eligible"}
                      </span>
                    </div>
                  </div>

                  {internship.eligibleBranches.length > 0 && (
                    <div className="flex items-start gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium text-foreground">Branches: </span>
                        <span className="text-muted-foreground">{internship.eligibleBranches.join(", ")}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-border/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs text-muted-foreground">
              <div className="space-y-0.5">
                <p>
                  Official destination:{" "}
                  <span className="font-mono text-[11px] text-foreground break-all">
                    {new URL(internship.officialApplyUrl).hostname}
                  </span>
                </p>
                <p>Clicking the application button will open the employer&apos;s verified job portal.</p>
              </div>

              <a
                href={internship.officialApplyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({
                  size: "sm",
                  className: "text-xs gap-1.5 shrink-0",
                })}
              >
                <span>Proceed to Apply</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
