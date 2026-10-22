"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ApplicationStatus } from "@prisma/client"
import { deleteApplication } from "@/actions/applications"
import { StageTransitionDialog } from "@/components/applications/stage-transition-dialog"
import { Button } from "@/components/ui/button"
import { ArrowRight, Trash2, Loader2, Edit3 } from "lucide-react"

interface ApplicationDetailActionsProps {
  applicationId: string
  currentStatus: ApplicationStatus
  companyName: string
  roleTitle: string
}

export function ApplicationDetailActions({
  applicationId,
  currentStatus,
  companyName,
  roleTitle,
}: ApplicationDetailActionsProps) {
  const router = useRouter()
  const [isTransitionOpen, setIsTransitionOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this application? All audit history will be permanently deleted.")) {
      return
    }

    setDeleting(true)
    const res = await deleteApplication(applicationId)

    if (res.success) {
      router.push("/applications")
      router.refresh()
    } else {
      alert(res.error || "Failed to delete application")
      setDeleting(false)
    }
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          size="sm"
          onClick={() => setIsTransitionOpen(true)}
          className="gap-1.5 shadow-2xs font-medium"
        >
          <ArrowRight className="h-4 w-4" />
          Update Stage
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleDelete}
          disabled={deleting}
          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          title="Delete application"
        >
          {deleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </Button>
      </div>

      <StageTransitionDialog
        isOpen={isTransitionOpen}
        onClose={() => setIsTransitionOpen(false)}
        applicationId={applicationId}
        currentStatus={currentStatus}
        companyName={companyName}
        roleTitle={roleTitle}
      />
    </>
  )
}
