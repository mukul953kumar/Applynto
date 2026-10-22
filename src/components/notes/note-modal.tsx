"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { NoteCategory } from "@prisma/client"
import { createNote, updateNote } from "@/actions/notes"
import { NOTE_CATEGORY_CONFIG, NoteItem } from "@/components/notes/note-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Loader2, X } from "lucide-react"

interface ApplicationOption {
  id: string
  companyName: string
  roleTitle: string
}

interface NoteModalProps {
  isOpen: boolean
  onClose: () => void
  applications: ApplicationOption[]
  initialNote?: NoteItem | null
  preselectedApplicationId?: string
}

export function NoteModal({
  isOpen,
  onClose,
  applications,
  initialNote,
  preselectedApplicationId,
}: NoteModalProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState(initialNote?.title || "")
  const [content, setContent] = useState(initialNote?.content || "")
  const [category, setCategory] = useState<NoteCategory>(
    initialNote?.category || NoteCategory.GENERAL
  )
  const [applicationId, setApplicationId] = useState(
    initialNote?.applicationId || preselectedApplicationId || ""
  )
  const [tagInput, setTagInput] = useState("")
  const [tags, setTags] = useState<string[]>(initialNote?.tags || [])

  useEffect(() => {
    if (initialNote) {
      setTitle(initialNote.title)
      setContent(initialNote.content)
      setCategory(initialNote.category)
      setApplicationId(initialNote.applicationId || "")
      setTags(initialNote.tags || [])
    } else {
      setTitle("")
      setContent("")
      setCategory(NoteCategory.GENERAL)
      setApplicationId(preselectedApplicationId || "")
      setTags([])
    }
  }, [initialNote, preselectedApplicationId])

  if (!isOpen) return null

  function handleAddTag() {
    const trimmed = tagInput.trim()
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed])
    }
    setTagInput("")
  }

  function handleRemoveTag(t: string) {
    setTags(tags.filter((item) => item !== t))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) {
      setError("Please enter a note title")
      return
    }

    if (!content.trim()) {
      setError("Note content cannot be empty")
      return
    }

    setError(null)
    setLoading(true)

    let res
    if (initialNote) {
      res = await updateNote({
        id: initialNote.id,
        title,
        content,
        category,
        tags,
        applicationId: applicationId || undefined,
      })
    } else {
      res = await createNote({
        title,
        content,
        category,
        tags,
        applicationId: applicationId || undefined,
      })
    }

    if (!res.success) {
      setError(res.error || "Failed to save note")
      setLoading(false)
      return
    }

    setLoading(false)
    onClose()
    router.refresh()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in-0 duration-150">
      <Card className="w-full max-w-lg border-border/80 shadow-2xl relative max-h-[90vh] flex flex-col">
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <CardHeader className="pb-3 shrink-0">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            {initialNote ? "Edit Note" : "Create Personal Note"}
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Save company insights, technical interview snippets, HR answers, or OA notes.
          </p>
        </CardHeader>

        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 p-2.5 text-xs text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Note Title <span className="text-destructive">*</span>
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Google SWE Intern System Design Tips or Round 1 Recap"
              required
              className="text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as NoteCategory)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-2xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {Object.entries(NOTE_CATEGORY_CONFIG).map(([k, cfg]) => (
                  <option key={k} value={k}>
                    {cfg.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Link to Application</label>
              <select
                value={applicationId}
                onChange={(e) => setApplicationId(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-2xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">None (General note)</option>
                {applications.map((app) => (
                  <option key={app.id} value={app.id}>
                    {app.companyName} — {app.roleTitle}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Content & Insights <span className="text-destructive">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={8}
              placeholder="Write down questions asked, company tech stack notes, key learnings, or follow-up points..."
              className="w-full rounded-md border border-input bg-background p-2.5 text-xs font-mono shadow-2xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-foreground">Tags</label>
            <div className="flex flex-wrap gap-1 min-h-[30px]">
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 rounded bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
                >
                  {t}
                  <button type="button" onClick={() => handleRemoveTag(t)}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleAddTag()
                  }
                }}
                placeholder="Add tag (e.g. dsa, system-design)..."
                className="text-xs"
              />
              <Button type="button" variant="outline" size="sm" onClick={handleAddTag}>
                Add
              </Button>
            </div>
          </div>

          <CardFooter className="px-0 pt-3 pb-2 flex justify-end gap-2 border-t">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={loading} className="gap-1.5">
              {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {initialNote ? "Update Note" : "Save Note"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
