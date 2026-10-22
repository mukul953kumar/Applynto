"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { NoteCategory } from "@prisma/client"
import { deleteNote } from "@/actions/notes"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  FileText,
  Briefcase,
  Trash2,
  Edit2,
  Loader2,
  Calendar,
  Tag,
} from "lucide-react"

export const NOTE_CATEGORY_CONFIG: Record<
  NoteCategory,
  { label: string; badgeClass: string }
> = {
  GENERAL: {
    label: "General",
    badgeClass: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700",
  },
  COMPANY_RESEARCH: {
    label: "Company Research",
    badgeClass: "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800",
  },
  INTERVIEW_PREP: {
    label: "Interview Prep",
    badgeClass: "bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800",
  },
  TECHNICAL_QUESTIONS: {
    label: "Technical Questions",
    badgeClass: "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  },
  HR_QUESTIONS: {
    label: "HR & Behavioral",
    badgeClass: "bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200 dark:border-teal-800",
  },
  ASSESSMENT_NOTES: {
    label: "Assessment / OA Notes",
    badgeClass: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
  },
  FOLLOW_UP: {
    label: "Follow-up",
    badgeClass: "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800",
  },
}

export type NoteItem = {
  id: string
  title: string
  content: string
  category: NoteCategory
  tags: string[]
  applicationId: string | null
  createdAt: Date
  updatedAt: Date
  application: {
    id: string
    companyName: string
    roleTitle: string
  } | null
}

interface NoteCardProps {
  note: NoteItem
  onEdit: (note: NoteItem) => void
}

export function NoteCard({ note, onEdit }: NoteCardProps) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  const cfg = NOTE_CATEGORY_CONFIG[note.category] || NOTE_CATEGORY_CONFIG.GENERAL

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this note?")) {
      return
    }

    setDeleting(true)
    const res = await deleteNote(note.id)
    setDeleting(false)

    if (res.success) {
      router.refresh()
    } else {
      alert(res.error || "Failed to delete note")
    }
  }

  return (
    <Card className="border-border/80 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
      <CardHeader className="pb-2.5">
        <div className="flex items-start justify-between gap-2">
          <span
            className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium border ${cfg.badgeClass}`}
          >
            {cfg.label}
          </span>

          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(note)}
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              title="Edit note"
            >
              <Edit2 className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              disabled={deleting}
              className="h-7 w-7 text-muted-foreground hover:text-destructive"
              title="Delete note"
            >
              {deleting ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Trash2 className="h-3 w-3" />
              )}
            </Button>
          </div>
        </div>

        <CardTitle className="text-sm font-semibold text-foreground line-clamp-1 pt-1.5">
          {note.title}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3 pb-3 flex-1">
        <p className="text-xs text-muted-foreground whitespace-pre-wrap line-clamp-4 leading-relaxed font-mono">
          {note.content}
        </p>

        {note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {note.tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-0.5 rounded bg-muted/60 px-1.5 py-0.5 text-[10px] text-muted-foreground border border-border/40"
              >
                <Tag className="h-2.5 w-2.5" />
                {t}
              </span>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-2 pb-3 border-t text-[11px] text-muted-foreground flex items-center justify-between">
        {note.application ? (
          <Link
            href={`/applications/${note.application.id}`}
            className="flex items-center gap-1 text-primary hover:underline font-medium truncate max-w-[180px]"
          >
            <Briefcase className="h-3 w-3 shrink-0" />
            <span className="truncate">{note.application.companyName}</span>
          </Link>
        ) : (
          <span className="text-muted-foreground/60 italic">Standalone note</span>
        )}

        <span className="flex items-center gap-1 text-[10px]">
          <Calendar className="h-3 w-3" />
          {new Date(note.updatedAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
          })}
        </span>
      </CardFooter>
    </Card>
  )
}
