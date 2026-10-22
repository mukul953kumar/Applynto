"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useTransition } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, SlidersHorizontal, RotateCcw } from "lucide-react"

export function InternshipFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const currentQ = searchParams.get("q") || ""
  const currentMode = searchParams.get("workMode") || ""
  const currentSort = searchParams.get("sort") || "newest"
  const currentVerified = searchParams.get("verifiedOnly") === "true"

  function updateQuery(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.set("page", "1")

    startTransition(() => {
      router.push(`/internships?${params.toString()}`)
    })
  }

  function handleReset() {
    startTransition(() => {
      router.push("/internships")
    })
  }

  const hasActiveFilters = Boolean(currentQ || currentMode || currentVerified || currentSort !== "newest")

  return (
    <div className="space-y-3 bg-card border border-border/80 rounded-lg p-3 sm:p-4 shadow-2xs">
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-6 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by role, company, or skills (e.g. React, Python)..."
            defaultValue={currentQ}
            onChange={(e) => {
              const val = e.target.value
              const timer = setTimeout(() => {
                updateQuery("q", val.trim() || null)
              }, 400)
              return () => clearTimeout(timer)
            }}
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="sm:col-span-3">
          <select
            value={currentMode}
            onChange={(e) => updateQuery("workMode", e.target.value || null)}
            className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            aria-label="Filter by work mode"
          >
            <option value="">All Work Modes</option>
            <option value="REMOTE">Remote</option>
            <option value="HYBRID">Hybrid</option>
            <option value="ON_SITE">On-site</option>
          </select>
        </div>

        <div className="sm:col-span-3">
          <select
            value={currentSort}
            onChange={(e) => updateQuery("sort", e.target.value)}
            className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            aria-label="Sort listings"
          >
            <option value="newest">Recently Published</option>
            <option value="deadline">Approaching Deadline</option>
            <option value="stipend">Highest Stipend</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-border/40 text-xs">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-1.5 cursor-pointer text-muted-foreground hover:text-foreground">
            <input
              type="checkbox"
              checked={currentVerified}
              onChange={(e) => updateQuery("verifiedOnly", e.target.checked ? "true" : null)}
              className="rounded border-border text-primary focus:ring-0 h-3.5 w-3.5 cursor-pointer"
            />
            <span className="font-medium">Verified listings only</span>
          </label>
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1 px-2"
          >
            <RotateCcw className="h-3 w-3" />
            Reset filters
          </Button>
        )}
      </div>
    </div>
  )
}
