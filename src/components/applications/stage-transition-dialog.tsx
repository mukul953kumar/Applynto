"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ApplicationStatus } from "@prisma/client"
import { updateApplicationStage } from "@/actions/applications"
import { STATUS_CONFIG } from "@/components/applications/application-status-badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Loader2, X } from "lucide-react"

interface StageTransitionDialogProps {
  applicationId: string
  currentStatus: ApplicationStatus
  companyName: string
  roleTitle: string
  isOpen: boolean
  onClose: () => void
  initialTargetStatus?: ApplicationStatus
}

export function StageTransitionDialog({
  applicationId,
  currentStatus,
  companyName,
  roleTitle,
  isOpen,
  onClose,
  initialTargetStatus,
}: StageTransitionDialogProps) {
  const router = useRouter()
  const [targetStatus, setTargetStatus] = useState<ApplicationStatus>(
    initialTargetStatus || currentStatus
  )
  const [note, setNote] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const allStatuses = Object.keys(STATUS_CONFIG) as ApplicationStatus[]

  async function handleConfirm() {
    if (targetStatus === currentStatus) {
      onClose()
      return
    }

    setLoading(true)
    setError(null)

    const res = await updateApplicationStage({
      applicationId,
      newStatus: targetStatus,
      note: note.trim() || undefined,
    })

    if (!res.success) {
      setError(res.error || "Failed to update stage")
      setLoading(false)
      return
    }

    setLoading(false)
    onClose()
    router.refresh()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in-0 duration-150">
      <Card className="w-full max-w-md border-border/80 shadow-2xl relative">
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Update Stage</CardTitle>
          <p className="text-xs text-muted-foreground truncate">
            {roleTitle} at {companyName}
          </p>
        </CardHeader>

        <CardContent className="space-y-4 pt-1">
          {error && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 p-2.5 text-xs text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Select New Stage</label>
            <div className="grid grid-cols-2 gap-2">
              {allStatuses.map((st) => {
                const cfg = STATUS_CONFIG[st]
                const isSelected = targetStatus === st
                const isCurrent = currentStatus === st

                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setTargetStatus(st)}
                    className={`flex items-center gap-2 p-2 rounded-lg border text-xs font-medium text-left transition-all ${
                      isSelected
                        ? "border-primary bg-primary/10 text-primary shadow-xs ring-1 ring-primary/20"
                        : "border-border hover:bg-muted/50 text-foreground"
                    }`}
                  >
                    <span className={`h-2 w-2 rounded-full shrink-0 ${cfg.dotClass}`} />
                    <span className="truncate">{cfg.label}</span>
                    {isCurrent && (
                      <span className="ml-auto text-[10px] text-muted-foreground">Current</span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Transition Note <span className="text-muted-foreground font-normal">(Optional audit trail note)</span>
            </label>
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g., Cleared round 1 coding, HackerRank link received"
              className="text-xs"
              maxLength={500}
            />
          </div>
        </CardContent>

        <CardFooter className="flex justify-end gap-2 border-t pt-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleConfirm}
            disabled={loading || targetStatus === currentStatus}
            className="gap-1.5"
          >
            {loading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <ArrowRight className="h-3.5 w-3.5" />
            )}
            Move to {STATUS_CONFIG[targetStatus]?.label || targetStatus}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
