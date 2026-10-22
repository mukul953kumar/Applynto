import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"
import {
  Flame,
  Clock,
  AlertTriangle,
  Video,
  CheckCircle2,
  ChevronRight,
  Sparkles,
} from "lucide-react"

type FocusItem = {
  id: string
  type: "APPLICATION_ACTION" | "REMINDER" | "INTERVIEW"
  title: string
  subtitle: string
  dueAt: Date
  isOverdue: boolean
  link: string
}

interface DashboardFocusSectionProps {
  items: FocusItem[]
}

export function DashboardFocusSection({ items }: DashboardFocusSectionProps) {
  const now = new Date()

  return (
    <Card className="border-border/80 shadow-2xs">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Flame className="h-4 w-4 text-amber-500" />
          What to Focus on Next
        </CardTitle>
        <span className="text-[11px] text-muted-foreground font-medium">
          Priority Queue
        </span>
      </CardHeader>

      <CardContent>
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-6 text-center border border-dashed rounded-lg bg-card/40">
            <div className="rounded-full bg-emerald-500/10 p-2.5 text-emerald-600 dark:text-emerald-400 mb-2">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <h4 className="text-xs font-semibold text-foreground">You are all caught up!</h4>
            <p className="text-[11px] text-muted-foreground mt-0.5 max-w-xs">
              No overdue actions, pending reminders, or upcoming interviews in the next 48 hours.
            </p>
            <div className="flex items-center gap-2 mt-3">
              <Link
                href="/internships"
                className={buttonVariants({ variant: "outline", size: "sm", className: "h-7 text-xs" })}
              >
                Find New Opportunities
              </Link>
              <Link
                href="/applications/new"
                className={buttonVariants({ size: "sm", className: "h-7 text-xs" })}
              >
                Log an Application
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            {items.map((item) => {
              const dueDate = new Date(item.dueAt)
              const isOverdue = item.isOverdue || dueDate < now

              return (
                <div
                  key={`${item.type}-${item.id}`}
                  className={`flex items-center justify-between gap-3 p-3 rounded-lg border transition-all ${
                    isOverdue
                      ? "bg-rose-500/5 border-rose-500/30"
                      : "bg-card border-border/70 hover:border-primary/40 shadow-2xs"
                  }`}
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="mt-0.5 shrink-0">
                      {item.type === "INTERVIEW" ? (
                        <div className="rounded-md bg-blue-500/10 p-1.5 text-blue-600 dark:text-blue-400">
                          <Video className="h-3.5 w-3.5" />
                        </div>
                      ) : isOverdue ? (
                        <div className="rounded-md bg-rose-500/10 p-1.5 text-rose-600 dark:text-rose-400">
                          <AlertTriangle className="h-3.5 w-3.5" />
                        </div>
                      ) : (
                        <div className="rounded-md bg-amber-500/10 p-1.5 text-amber-600 dark:text-amber-400">
                          <Clock className="h-3.5 w-3.5" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {item.subtitle}
                      </p>
                      <span
                        className={`text-[10px] font-medium flex items-center gap-1 mt-0.5 ${
                          isOverdue
                            ? "text-rose-600 dark:text-rose-400 font-semibold"
                            : "text-muted-foreground"
                        }`}
                      >
                        {isOverdue && "Overdue: "}
                        {dueDate.toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>

                  <Link
                    href={item.link}
                    className={buttonVariants({
                      variant: isOverdue ? "destructive" : "outline",
                      size: "sm",
                      className: "h-7 px-2.5 text-xs gap-1 shrink-0 font-medium",
                    })}
                  >
                    Action
                    <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
