import { ApplicationStatus } from "@prisma/client"
import { STATUS_CONFIG } from "@/components/applications/application-status-badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { History, ArrowRight, Clock } from "lucide-react"

type StatusHistoryItem = {
  id: string
  previousStatus: ApplicationStatus | null
  newStatus: ApplicationStatus
  note: string | null
  createdAt: Date
}

interface ApplicationTimelineProps {
  history: StatusHistoryItem[]
}

export function ApplicationTimeline({ history }: ApplicationTimelineProps) {
  if (history.length === 0) {
    return (
      <Card className="border-border/80 shadow-2xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <History className="h-4 w-4 text-muted-foreground" />
            Stage History & Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">No stage transitions recorded yet.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/80 shadow-2xs">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <History className="h-4 w-4 text-muted-foreground" />
          Stage History & Timeline
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Append-only audit trail recording every progression in your application pipeline.
        </p>
      </CardHeader>

      <CardContent>
        <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
          {history.map((item, idx) => {
            const currentCfg = STATUS_CONFIG[item.newStatus]
            const prevCfg = item.previousStatus ? STATUS_CONFIG[item.previousStatus] : null

            return (
              <div key={item.id} className="relative group">
                <span
                  className={`absolute -left-6 top-1 h-4 w-4 rounded-full border-2 border-background ring-2 ring-border shrink-0 ${currentCfg.dotClass}`}
                />

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {prevCfg ? (
                      <div className="flex items-center gap-1.5 text-xs font-semibold">
                        <span className="text-muted-foreground">{prevCfg.label}</span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        <span className="text-foreground">{currentCfg.label}</span>
                      </div>
                    ) : (
                      <span className="text-xs font-semibold text-foreground">
                        Initial Stage: {currentCfg.label}
                      </span>
                    )}

                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(item.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  {item.note && (
                    <div className="rounded-md bg-muted/40 border border-border/60 p-2 text-xs text-foreground/90 mt-1">
                      {item.note}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
