import Link from "next/link"
import { getCurrentUser } from "@/lib/session"
import { buttonVariants } from "@/components/ui/button"
import { ArrowRight, Briefcase, Calendar, Layers, ShieldCheck } from "lucide-react"

export const metadata = {
  title: "Applynto — Centralized Internship & Application Tracker",
  description: "Discover verified opportunities, organize job applications, manage interviews, and track deadlines in one clean dashboard.",
}

export default async function LandingPage() {
  const user = await getCurrentUser()

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 h-16 w-full border-b border-border bg-background/95 backdrop-blur-xs px-4 md:px-8 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-semibold text-sm">
            A
          </div>
          <span className="font-semibold text-lg tracking-tight">Applynto</span>
        </div>

        <nav className="flex items-center gap-3">
          <Link href="/internships" className={buttonVariants({ variant: "ghost", size: "sm" })}>
            Browse Internships
          </Link>

          {user ? (
            <Link href="/dashboard" className={buttonVariants({ size: "sm" })}>
              Dashboard <ArrowRight className="h-4 w-4 ml-1.5" />
            </Link>
          ) : (
            <>
              <Link href="/login" className={buttonVariants({ variant: "outline", size: "sm" })}>
                Sign in
              </Link>
              <Link href="/signup" className={buttonVariants({ size: "sm" })}>
                Get started
              </Link>
            </>
          )}
        </nav>
      </header>

      <main className="flex-1">
        <section className="py-20 md:py-28 px-4 md:px-8 max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-muted/40 text-xs font-medium text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            Built specifically for college students & fresh graduates
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground max-w-3xl mx-auto">
            Stop losing track of your internship applications.
          </h1>

          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Replace messy spreadsheets, missed deadlines, and forgotten recruiter follow-ups. Applynto gives you a single dashboard to discover relevant roles, track application stages, and prepare for interviews.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link
              href={user ? "/dashboard" : "/signup"}
              className={buttonVariants({ size: "lg", className: "w-full sm:w-auto h-11 px-6" })}
            >
              {user ? "Open Dashboard" : "Start Tracking for Free"}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>

            <Link
              href="/internships"
              className={buttonVariants({ variant: "outline", size: "lg", className: "w-full sm:w-auto h-11 px-6" })}
            >
              Explore Opportunities
            </Link>
          </div>
        </section>

        <section className="py-16 border-t border-border bg-muted/20">
          <div className="max-w-6xl mx-auto px-4 md:px-8 space-y-12">
            <div className="text-center space-y-2 max-w-xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Everything you need in one workspace</h2>
              <p className="text-sm text-muted-foreground">
                Engineered for practical day-to-day use, with direct information density and zero fluff.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border border-border/80 bg-card rounded-lg p-6 space-y-3 shadow-2xs">
                <div className="h-10 w-10 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                  <Briefcase className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold">Verified Discovery</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Filter by role, skills, stipend, degree, and work mode. Verified source links ensure you never waste time on dead opportunities.
                </p>
              </div>

              <div className="border border-border/80 bg-card rounded-lg p-6 space-y-3 shadow-2xs">
                <div className="h-10 w-10 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                  <Layers className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold">Stage-by-Stage Tracking</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Track applications from Applied to OA, Interview, Offer or Rejection. Switch between Kanban board and detailed table views anytime.
                </p>
              </div>

              <div className="border border-border/80 bg-card rounded-lg p-6 space-y-3 shadow-2xs">
                <div className="h-10 w-10 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                  <Calendar className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold">Interviews & Reminders</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Record round types, interviewer details, and prep notes. Stay alert with timely follow-up reminders on your personal dashboard.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 border-t border-border">
          <div className="max-w-4xl mx-auto px-4 md:px-8 text-center space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Ready to streamline your internship search?</h2>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              Join students who track their career milestones with clarity and confidence.
            </p>
            <div>
              <Link
                href={user ? "/dashboard" : "/signup"}
                className={buttonVariants({ size: "lg", className: "h-11 px-8" })}
              >
                {user ? "Go to your Dashboard" : "Create your free account"}
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8 px-4 md:px-8 text-center text-xs text-muted-foreground">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Applynto. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/internships" className="hover:text-foreground">Internships</Link>
            <Link href="/login" className="hover:text-foreground">Sign In</Link>
            <Link href="/signup" className="hover:text-foreground">Sign Up</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
