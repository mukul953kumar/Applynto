"use client"

import { useTransition } from "react"
import { toggleListingStatus, toggleListingVerification } from "@/actions/admin-internships"
import { Button } from "@/components/ui/button"
import { ListingStatus, VerificationStatus } from "@prisma/client"
import { Check, Pause, Play, ShieldAlert, ShieldCheck } from "lucide-react"

interface ListingActionsProps {
  id: string
  status: ListingStatus
  verificationStatus: VerificationStatus
}

export function ListingActions({ id, status, verificationStatus }: ListingActionsProps) {
  const [isPending, startTransition] = useTransition()

  function handleStatusToggle() {
    const nextStatus = status === ListingStatus.PUBLISHED ? ListingStatus.PAUSED : ListingStatus.PUBLISHED
    startTransition(async () => {
      await toggleListingStatus(id, nextStatus)
    })
  }

  function handleVerificationToggle() {
    const nextVerification =
      verificationStatus === VerificationStatus.VERIFIED
        ? VerificationStatus.UNVERIFIED
        : VerificationStatus.VERIFIED
    startTransition(async () => {
      await toggleListingVerification(id, nextVerification)
    })
  }

  return (
    <div className="flex items-center gap-1.5 justify-end">
      <Button
        variant="ghost"
        size="sm"
        disabled={isPending}
        onClick={handleVerificationToggle}
        className="h-7 text-[11px] px-2 gap-1 text-muted-foreground hover:text-foreground"
        title="Toggle Verification"
      >
        {verificationStatus === VerificationStatus.VERIFIED ? (
          <>
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>Verified</span>
          </>
        ) : (
          <>
            <ShieldAlert className="h-3.5 w-3.5 text-amber-500" />
            <span>Unverified</span>
          </>
        )}
      </Button>

      <Button
        variant="outline"
        size="sm"
        disabled={isPending}
        onClick={handleStatusToggle}
        className="h-7 text-[11px] px-2 gap-1"
      >
        {status === ListingStatus.PUBLISHED ? (
          <>
            <Pause className="h-3 w-3" />
            <span>Pause</span>
          </>
        ) : (
          <>
            <Play className="h-3 w-3" />
            <span>Publish</span>
          </>
        )}
      </Button>
    </div>
  )
}
