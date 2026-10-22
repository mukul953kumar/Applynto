import Link from "next/link"
import { InternshipListItem } from "@/actions/internships"
import { SaveButton } from "@/components/internships/save-button"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Calendar, CheckCircle2, Clock, MapPin, IndianRupee, ArrowUpRight } from "lucide-react"

interface InternshipCardProps {
  internship: InternshipListItem
}

export function InternshipCard({ internship }: InternshipCardProps) {
  function formatStipend() {
    if (internship.stipendMin && internship.stipendMax) {
      if (internship.stipendMin === internship.stipendMax) {
        return `₹${internship.stipendMin.toLocaleString("en-IN")}/mo`
      }
      return `₹${internship.stipendMin.toLocaleString("en-IN")} - ₹${internship.stipendMax.toLocaleString("en-IN")}/mo`
    }
    if (internship.stipendMin) {
      return `From ₹${internship.stipendMin.toLocaleString("en-IN")}/mo`
    }
    return "Not specified"
  }

  function formatDeadline() {
    if (!internship.deadline) return "Rolling admission"
    const date = new Date(internship.deadline)
    return date.toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const workModeLabels: Record<string, string> = {
    REMOTE: "Remote",
    HYBRID: "Hybrid",
    ON_SITE: "On-site",
    NOT_SPECIFIED: "Unspecified",
  }

  return (
    <Card className="flex flex-col justify-between border-border/80 hover:border-border transition-colors shadow-2xs">
      <CardHeader className="pb-3 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted border border-border text-xs font-bold text-foreground">
              {internship.companyName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground line-clamp-1">{internship.companyName}</p>
              <h3 className="font-semibold text-sm leading-snug line-clamp-1 text-foreground">
                <Link href={`/internships/${internship.id}`} className="hover:underline">
                  {internship.title}
                </Link>
              </h3>
            </div>
          </div>
          <SaveButton internshipId={internship.id} initialSaved={internship.isSaved} size="icon" />
        </div>

        <div className="flex flex-wrap gap-1.5 pt-1">
          <Badge variant="outline" className="text-[11px] font-normal">
            {workModeLabels[internship.workMode] || internship.workMode}
          </Badge>

          {internship.location && (
            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground px-1.5 py-0.5">
              <MapPin className="h-3 w-3" />
              <span className="line-clamp-1 max-w-[120px]">{internship.location}</span>
            </span>
          )}

          {internship.verificationStatus === "VERIFIED" && (
            <Badge variant="secondary" className="text-[11px] font-medium gap-1 text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
              <CheckCircle2 className="h-3 w-3" />
              Verified
            </Badge>
          )}

          {internship.isExpired && (
            <Badge variant="destructive" className="text-[11px]">
              Expired
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pb-3">
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {internship.shortDescription}
        </p>

        <div className="flex flex-wrap gap-1">
          {internship.requiredSkills.slice(0, 3).map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground"
            >
              {skill}
            </span>
          ))}
          {internship.requiredSkills.length > 3 && (
            <span className="text-[10px] text-muted-foreground px-1 py-0.5">
              +{internship.requiredSkills.length - 3} more
            </span>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-semibold text-muted-foreground/80">Stipend</span>
          <span className="font-medium text-foreground text-xs flex items-center">
            {formatStipend()}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex flex-col text-right">
            <span className="text-[10px] uppercase font-semibold text-muted-foreground/80">Deadline</span>
            <span className="text-xs flex items-center justify-end gap-1 font-medium text-foreground">
              <Clock className="h-3 w-3 text-muted-foreground" />
              {formatDeadline()}
            </span>
          </div>

          <Link
            href={`/internships/${internship.id}`}
            className={buttonVariants({ variant: "ghost", size: "icon", className: "h-8 w-8 ml-1" })}
            aria-label={`View details for ${internship.title}`}
          >
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}
