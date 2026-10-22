"use client"

import { useState, useMemo } from "react"
import { NoteCategory } from "@prisma/client"
import { NoteCard, NoteItem, NOTE_CATEGORY_CONFIG } from "@/components/notes/note-card"
import { NoteModal } from "@/components/notes/note-modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, FileText, Sparkles } from "lucide-react"

interface ApplicationOption {
  id: string
  companyName: string
  roleTitle: string
}

interface NotesViewProps {
  initialNotes: NoteItem[]
  applications: ApplicationOption[]
  preselectedApplicationId?: string
}

export function NotesView({
  initialNotes,
  applications,
  preselectedApplicationId,
}: NotesViewProps) {
  const [isModalOpen, setIsModalOpen] = useState(!!preselectedApplicationId)
  const [editingNote, setEditingNote] = useState<NoteItem | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredNotes = useMemo(() => {
    return initialNotes.filter((note) => {
      if (selectedCategory !== "ALL" && note.category !== selectedCategory) {
        return false
      }

      if (searchQuery.trim().length > 0) {
        const query = searchQuery.toLowerCase()
        const matchTitle = note.title.toLowerCase().includes(query)
        const matchContent = note.content.toLowerCase().includes(query)
        const matchTag = note.tags.some((t) => t.toLowerCase().includes(query))
        const matchCompany = note.application?.companyName.toLowerCase().includes(query)
        return matchTitle || matchContent || matchTag || matchCompany
      }

      return true
    })
  }, [initialNotes, selectedCategory, searchQuery])

  function handleOpenCreate() {
    setEditingNote(null)
    setIsModalOpen(true)
  }

  function handleEdit(note: NoteItem) {
    setEditingNote(note)
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Personal Notes & Research
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Capture technical questions, system design reflections, company insights, and OA notes.
          </p>
        </div>

        <Button
          onClick={handleOpenCreate}
          size="sm"
          className="gap-1.5 shadow-2xs font-medium"
        >
          <Plus className="h-4 w-4" />
          Create Note
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes, questions, tags..."
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCategory("ALL")}
            className={`rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap transition-colors border ${
              selectedCategory === "ALL"
                ? "bg-primary text-primary-foreground border-primary shadow-2xs"
                : "bg-card text-muted-foreground border-border hover:bg-muted/50 hover:text-foreground"
            }`}
          >
            All Notes ({initialNotes.length})
          </button>

          {Object.entries(NOTE_CATEGORY_CONFIG).map(([k, cfg]) => {
            const count = initialNotes.filter((n) => n.category === k).length
            return (
              <button
                key={k}
                type="button"
                onClick={() => setSelectedCategory(k)}
                className={`rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap transition-colors border ${
                  selectedCategory === k
                    ? "bg-primary text-primary-foreground border-primary shadow-2xs"
                    : "bg-card text-muted-foreground border-border hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                {cfg.label} {count > 0 && `(${count})`}
              </button>
            )
          })}
        </div>
      </div>

      {filteredNotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/80 p-12 text-center bg-card/40">
          <div className="rounded-full bg-primary/10 p-3 text-primary mb-3">
            <FileText className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-foreground">No notes found</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">
            {searchQuery || selectedCategory !== "ALL"
              ? "No notes matched your search or category filter."
              : "Capture technical interview questions, preparation checklists, and company research."}
          </p>
          <Button onClick={handleOpenCreate} size="sm" className="mt-4 gap-1.5">
            <Plus className="h-4 w-4" />
            Write First Note
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map((note) => (
            <NoteCard key={note.id} note={note} onEdit={handleEdit} />
          ))}
        </div>
      )}

      <NoteModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingNote(null)
        }}
        applications={applications}
        initialNote={editingNote}
        preselectedApplicationId={preselectedApplicationId}
      />
    </div>
  )
}
