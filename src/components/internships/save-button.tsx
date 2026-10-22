"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toggleSaveInternship } from "@/actions/internships"
import { Button } from "@/components/ui/button"
import { Bookmark, Loader2 } from "lucide-react"

interface SaveButtonProps {
  internshipId: string
  initialSaved?: boolean
  className?: string
  size?: "default" | "sm" | "icon"
  showText?: boolean
}

export function SaveButton({
  internshipId,
  initialSaved = false,
  className,
  size = "icon",
  showText = false,
}: SaveButtonProps) {
  const router = useRouter()
  const [saved, setSaved] = useState(initialSaved)
  const [loading, setLoading] = useState(false)

  async function handleToggle(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    setLoading(true)
    const res = await toggleSaveInternship(internshipId)

    if (!res.success) {
      if (res.error?.includes("login") || res.error?.includes("auth")) {
        router.push("/login")
        return
      }
      setLoading(false)
      return
    }

    if (res.data) {
      setSaved(res.data.saved)
    }
    setLoading(false)
  }

  return (
    <Button
      variant={saved ? "default" : "outline"}
      size={size}
      className={className}
      onClick={handleToggle}
      disabled={loading}
      aria-label={saved ? "Remove from saved" : "Save internship"}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Bookmark className={`h-4 w-4 ${saved ? "fill-current" : ""}`} />
      )}
      {showText && <span className="ml-1.5">{saved ? "Saved" : "Save"}</span>}
    </Button>
  )
}
