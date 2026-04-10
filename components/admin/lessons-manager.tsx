"use client"

import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useState } from "react"
import { Plus, Trash2, Save, Loader2, Check, X } from "lucide-react"

const DEFAULT_LESSONS = ["L0", "L1", "L2", "L3", "L4", "L5"]

export function LessonsManager() {
  const lessons = useQuery(api.lessons.listLessons)
  const upsertLesson = useMutation(api.lessons.upsertLesson)
  const deleteLesson = useMutation(api.lessons.deleteLesson)

  const [editingLesson, setEditingLesson] = useState<string | null>(null)
  const [poolInput, setPoolInput] = useState("")
  const [saving, setSaving] = useState<string | null>(null)
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const [deleting, setDeleting] = useState<string | null>(null)
  const [newLessonId, setNewLessonId] = useState("")
  const [showNewForm, setShowNewForm] = useState(false)

  const getLesson = (lessonId: string) => lessons?.find((l) => l.lessonId === lessonId)

  const parsePool = (input: string): number[] => {
    return input
      .split(/[\s,]+/)
      .map((s) => s.trim())
      .filter((s) => s !== "")
      .map((s) => parseInt(s, 10))
      .filter((n) => !isNaN(n) && n >= 0 && n <= 64)
  }

  const formatPool = (pool: number[]): string => pool.join(", ")

  const handleEdit = (lessonId: string) => {
    const lesson = getLesson(lessonId)
    setEditingLesson(lessonId)
    setPoolInput(lesson ? formatPool(lesson.pool) : "")
  }

  const handleSave = async (lessonId: string) => {
    const pool = parsePool(poolInput)
    setSaving(lessonId)
    try {
      await upsertLesson({ lessonId, pool })
      setSavedIds((prev) => new Set(prev).add(lessonId))
      setTimeout(() => setSavedIds((prev) => { const s = new Set(prev); s.delete(lessonId); return s }), 2000)
      setEditingLesson(null)
    } finally {
      setSaving(null)
    }
  }

  const handleDelete = async (lessonId: string) => {
    if (!confirm(`Opravdu smazat lekci ${lessonId}?`)) return
    setDeleting(lessonId)
    try {
      await deleteLesson({ lessonId })
    } finally {
      setDeleting(null)
    }
  }

  const handleAddNew = async () => {
    const id = newLessonId.trim()
    if (!id) return
    setSaving(id)
    try {
      await upsertLesson({ lessonId: id, pool: [] })
      setNewLessonId("")
      setShowNewForm(false)
      handleEdit(id)
    } finally {
      setSaving(null)
    }
  }

  if (lessons === undefined) {
    return (
      <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Načítám lekce…
      </div>
    )
  }

  const existingIds = new Set(lessons.map((l) => l.lessonId))

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Každá lekce má pool ID karet (0–64), ze kterých uživatelé tahají.
        </p>
        <button
          onClick={() => setShowNewForm(!showNewForm)}
          className="flex items-center gap-1 rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground hover:opacity-90 transition-opacity"
        >
          <Plus className="h-3 w-3" /> Nová lekce
        </button>
      </div>

      {/* New lesson form */}
      {showNewForm && (
        <div className="rounded-lg border border-dashed border-primary/50 bg-primary/5 p-3 space-y-2">
          <p className="text-xs font-medium text-foreground">Nová lekce</p>
          <div className="flex gap-2">
            <input
              value={newLessonId}
              onChange={(e) => setNewLessonId(e.target.value)}
              placeholder="ID lekce (např. L6)"
              className="flex-1 rounded-md border border-input bg-background px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
              onKeyDown={(e) => e.key === "Enter" && handleAddNew()}
            />
            <button
              onClick={handleAddNew}
              disabled={!newLessonId.trim() || saving === newLessonId}
              className="rounded-md bg-primary px-3 py-1 text-xs text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {saving === newLessonId ? <Loader2 className="h-3 w-3 animate-spin" /> : "Vytvořit"}
            </button>
            <button
              onClick={() => setShowNewForm(false)}
              className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}

      {/* Existing lessons */}
      {lessons.length === 0 && !showNewForm && (
        <div className="rounded-lg border border-dashed border-border bg-muted/20 p-6 text-center">
          <p className="text-xs text-muted-foreground">Zatím žádné lekce. Vytvořte první.</p>
          <div className="mt-3 flex flex-wrap justify-center gap-1">
            {DEFAULT_LESSONS.map((id) => (
              <button
                key={id}
                onClick={async () => {
                  await upsertLesson({ lessonId: id, pool: [] })
                  handleEdit(id)
                }}
                className="rounded-md border border-border bg-background px-2 py-0.5 text-xs text-muted-foreground hover:border-primary hover:text-foreground transition-colors"
              >
                + {id}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        {lessons.map((lesson) => (
          <div key={lesson.lessonId} className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="flex items-center gap-3 px-3 py-2">
              <span className="w-10 shrink-0 text-xs font-mono font-bold text-foreground">
                {lesson.lessonId}
              </span>
              <div className="flex-1 min-w-0">
                {editingLesson === lesson.lessonId ? (
                  <input
                    value={poolInput}
                    onChange={(e) => setPoolInput(e.target.value)}
                    placeholder="Např.: 1, 2, 3, 15, 30"
                    autoFocus
                    className="w-full rounded-md border border-input bg-background px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                    onKeyDown={(e) => e.key === "Enter" && handleSave(lesson.lessonId)}
                  />
                ) : (
                  <button
                    className="w-full text-left text-xs text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => handleEdit(lesson.lessonId)}
                  >
                    {lesson.pool.length === 0 ? (
                      <span className="italic">prázdný pool – klikněte pro editaci</span>
                    ) : (
                      <span>
                        <span className="font-medium text-foreground">{lesson.pool.length} karet:</span>{" "}
                        {lesson.pool.slice(0, 20).join(", ")}
                        {lesson.pool.length > 20 && "…"}
                      </span>
                    )}
                  </button>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-1">
                {editingLesson === lesson.lessonId ? (
                  <>
                    <button
                      onClick={() => handleSave(lesson.lessonId)}
                      disabled={saving === lesson.lessonId}
                      className="flex items-center gap-1 rounded-md bg-primary px-2 py-1 text-xs text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
                    >
                      {saving === lesson.lessonId ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : savedIds.has(lesson.lessonId) ? (
                        <><Check className="h-3 w-3" /> OK</>
                      ) : (
                        <><Save className="h-3 w-3" /> Uložit</>
                      )}
                    </button>
                    <button
                      onClick={() => setEditingLesson(null)}
                      className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleDelete(lesson.lessonId)}
                    disabled={deleting === lesson.lessonId}
                    className="rounded-md px-2 py-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
                    title="Smazat lekci"
                  >
                    {deleting === lesson.lessonId ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Trash2 className="h-3 w-3" />
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Pool validation hint */}
            {editingLesson === lesson.lessonId && (
              <div className="border-t border-border bg-muted/20 px-3 py-1.5">
                <p className="text-[10px] text-muted-foreground">
                  Zadejte ID karet oddělená čárkou nebo mezerou (0–64).
                  Aktuálně: <span className="font-medium">{parsePool(poolInput).length} karet</span>
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
