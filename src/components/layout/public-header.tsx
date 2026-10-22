import Link from "next/link"
import { getCurrentUser } from "@/lib/session"
import { buttonVariants } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export async function PublicHeader() {
  const user = await getCurrentUser()

  return (
    <header className="sticky top-0 z-40 h-14 w-full border-b border-border bg-background/95 backdrop-blur-xs px-4 md:px-8 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-semibold text-sm">
            A
          </div>
          <span className="font-semibold text-base tracking-tight">Applynto</span>
        </Link>

        <nav className="hidden sm:flex items-center gap-4 text-xs font-medium text-muted-foreground">
          <Link href="/internships" className="text-foreground hover:text-foreground">
            Internships
          </Link>
        </nav>
      </div>

      <div className="flex items-center gap-2.5">
        {user ? (
          <Link href="/dashboard" className={buttonVariants({ size: "sm", className: "h-8 text-xs gap-1.5" })}>
            Dashboard <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        ) : (
          <>
            <Link href="/login" className={buttonVariants({ variant: "outline", size: "sm", className: "h-8 text-xs" })}>
              Sign in
            </Link>
            <Link href="/signup" className={buttonVariants({ size: "sm", className: "h-8 text-xs" })}>
              Get started
            </Link>
          </>
        )}
      </div>
    </header>
  )
}
