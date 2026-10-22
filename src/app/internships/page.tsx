import { Suspense } from "react"
import Link from "next/link"
import { getPublicInternships } from "@/actions/internships"
import { InternshipCard } from "@/components/internships/internship-card"
import { InternshipFilters } from "@/components/internships/internship-filters"
import { PublicHeader } from "@/components/layout/public-header"
import { buttonVariants } from "@/components/ui/button"
import { Briefcase, ChevronLeft, ChevronRight } from "lucide-react"
import { getCurrentUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { calculateMatchScore } from "@/lib/matching"
import { WorkMode } from "@prisma/client"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Browse Internships | Applynto",
  description: "Discover verified internship opportunities tailored for students and fresh graduates.",
}

interface PageProps {
  searchParams: Promise<{
    q?: string
    workMode?: string
    degree?: string
    minStipend?: string
    verifiedOnly?: string
    sort?: "newest" | "deadline" | "stipend"
    page?: string
  }>
}

export default async function InternshipsPage({ searchParams }: PageProps) {
  const params = await searchParams

  const page = params.page ? parseInt(params.page, 10) : 1
  const minStipend = params.minStipend ? parseInt(params.minStipend, 10) : undefined

  const user = await getCurrentUser()
  const studentProfile = user
    ? await prisma.user.findUnique({
        where: { id: user.id },
        select: {
          skills: true,
          preferredRoles: true,
          preferredWorkModes: true,
          preferredLocations: true,
          graduationYear: true,
          degree: true,
          branch: true,
          minimumStipend: true,
        },
      })
    : null

  const result = await getPublicInternships({
    q: params.q,
    workMode: params.workMode as WorkMode | undefined,
    degree: params.degree,
    minStipend,
    verifiedOnly: params.verifiedOnly === "true",
    sort: params.sort,
    page,
    pageSize: 12,
  })

  function getPageUrl(targetPage: number) {
    const qp = new URLSearchParams()
    if (params.q) qp.set("q", params.q)
    if (params.workMode) qp.set("workMode", params.workMode)
    if (params.degree) qp.set("degree", params.degree)
    if (params.minStipend) qp.set("minStipend", params.minStipend)
    if (params.verifiedOnly) qp.set("verifiedOnly", params.verifiedOnly)
    if (params.sort) qp.set("sort", params.sort)
    qp.set("page", targetPage.toString())
    return `/internships?${qp.toString()}`
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <PublicHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-6 md:py-8 space-y-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Find Internship Opportunities</h1>
          <p className="text-sm text-muted-foreground">
            Explore verified listings, review eligibility criteria, and track your applications in one place.
          </p>
        </div>

        <Suspense fallback={<div className="h-28 bg-card rounded-lg animate-pulse" />}>
          <InternshipFilters />
        </Suspense>

        <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
          <span>
            Showing <strong className="text-foreground">{result.items.length}</strong> of{" "}
            <strong className="text-foreground">{result.total}</strong> opportunities
          </span>
          <span>
            Page <strong className="text-foreground">{result.page}</strong> of{" "}
            <strong className="text-foreground">{result.totalPages}</strong>
          </span>
        </div>

        {result.items.length === 0 ? (
          <div className="bg-card border border-border/80 rounded-lg p-12 text-center space-y-3">
            <div className="h-10 w-10 mx-auto rounded-full bg-muted flex items-center justify-center text-muted-foreground">
              <Briefcase className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-base">No matching internships found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Try adjusting your search query, removing some filters, or checking back soon for new postings.
            </p>
            <div className="pt-2">
              <Link href="/internships" className={buttonVariants({ variant: "outline", size: "sm", className: "text-xs" })}>
                Reset all filters
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {result.items.map((internship) => {
              const matchResult = studentProfile
                ? calculateMatchScore(studentProfile, {
                    ...internship,
                    preferredSkills: [],
                    eligibleDegrees: [],
                    eligibleBranches: [],
                    eligibleGraduationYears: [],
                  })
                : undefined

              return (
                <InternshipCard
                  key={internship.id}
                  internship={internship}
                  matchResult={matchResult}
                />
              )
            })}
          </div>
        )}

        {result.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            {result.page > 1 ? (
              <Link
                href={getPageUrl(result.page - 1)}
                className={buttonVariants({ variant: "outline", size: "sm", className: "h-8 text-xs gap-1" })}
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Previous
              </Link>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground opacity-50 px-3 py-1.5 border border-border rounded-md pointer-events-none">
                <ChevronLeft className="h-3.5 w-3.5" /> Previous
              </span>
            )}

            <span className="text-xs text-muted-foreground px-2">
              {result.page} / {result.totalPages}
            </span>

            {result.page < result.totalPages ? (
              <Link
                href={getPageUrl(result.page + 1)}
                className={buttonVariants({ variant: "outline", size: "sm", className: "h-8 text-xs gap-1" })}
              >
                Next <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground opacity-50 px-3 py-1.5 border border-border rounded-md pointer-events-none">
                Next <ChevronRight className="h-3.5 w-3.5" />
              </span>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
