"use client"

import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { useState, useRef, useCallback } from "react"
import { Upload, ImageIcon, Check, Loader2, ChevronDown, ChevronUp } from "lucide-react"

const TOTAL_CARDS = 65 // 0–64

export function CardsManager() {
  const cards = useQuery(api.cards.listCards)
  const upsertCard = useMutation(api.cards.upsertCard)
  const generateUploadUrl = useMutation(api.cards.generateUploadUrl)

  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [saving, setSaving] = useState<Record<number, boolean>>({})
  const [uploading, setUploading] = useState<Record<number, boolean>>({})
  const [messages, setMessages] = useState<Record<number, string>>({})
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set())
  const fileRefs = useRef<Record<number, HTMLInputElement | null>>({})

  const getCard = (cardId: number) => cards?.find((c) => c.cardId === cardId)

  const getMessage = (cardId: number) => {
    if (messages[cardId] !== undefined) return messages[cardId]
    return getCard(cardId)?.message ?? ""
  }

  const handleMessageChange = (cardId: number, value: string) => {
    setMessages((prev) => ({ ...prev, [cardId]: value }))
  }

  const handleSaveMessage = async (cardId: number) => {
    setSaving((prev) => ({ ...prev, [cardId]: true }))
    try {
      await upsertCard({ cardId, message: getMessage(cardId) })
      setSavedIds((prev) => new Set(prev).add(cardId))
      setTimeout(() => setSavedIds((prev) => { const s = new Set(prev); s.delete(cardId); return s }), 2000)
    } finally {
      setSaving((prev) => ({ ...prev, [cardId]: false }))
    }
  }

  const handleFileChange = async (cardId: number, file: File | null) => {
    if (!file) return
    setUploading((prev) => ({ ...prev, [cardId]: true }))
    try {
      const uploadUrl = await generateUploadUrl()
      const res = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      })
      if (!res.ok) throw new Error("Upload selhal")
      const { storageId } = await res.json() as { storageId: Id<"_storage"> }
      await upsertCard({ cardId, imageId: storageId })
    } catch (err) {
      console.error("Upload error:", err)
    } finally {
      setUploading((prev) => ({ ...prev, [cardId]: false }))
    }
  }

  if (cards === undefined) {
    return (
      <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Načítám karty…
      </div>
    )
  }

  return (
    <div className="space-y-1">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Karta 0 = rub, karty 1–64 = líc. Celkem {cards.length} karet má data.
        </p>
      </div>
      {Array.from({ length: TOTAL_CARDS }, (_, i) => {
        const card = getCard(i)
        const isExpanded = expandedId === i
        const hasImage = !!card?.imageUrl
        const hasMessage = !!card?.message

        return (
          <div
            key={i}
            className="rounded-lg border border-border bg-card overflow-hidden"
          >
            {/* Row header */}
            <button
              className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-muted/50 transition-colors"
              onClick={() => setExpandedId(isExpanded ? null : i)}
            >
              <span className="w-8 shrink-0 text-center text-xs font-mono font-semibold text-muted-foreground">
                {i === 0 ? "RUB" : String(i).padStart(2, "0")}
              </span>
              <div className="flex flex-1 items-center gap-2 min-w-0">
                <div className={`h-2 w-2 rounded-full shrink-0 ${hasImage ? "bg-green-500" : "bg-muted-foreground/30"}`} title={hasImage ? "Obrázek nahrán" : "Bez obrázku"} />
                <div className={`h-2 w-2 rounded-full shrink-0 ${hasMessage ? "bg-blue-500" : "bg-muted-foreground/30"}`} title={hasMessage ? "Vzkaz nastaven" : "Bez vzkazu"} />
                <span className="truncate text-xs text-muted-foreground">
                  {hasMessage ? card!.message : <span className="italic">bez vzkazu</span>}
                </span>
              </div>
              {isExpanded ? (
                <ChevronUp className="h-3 w-3 shrink-0 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" />
              )}
            </button>

            {/* Expanded panel */}
            {isExpanded && (
              <div className="border-t border-border bg-muted/20 px-3 py-3 space-y-3">
                <div className="flex gap-3">
                  {/* Image preview / upload */}
                  <div className="shrink-0">
                    <div
                      className="relative h-16 w-16 rounded-md border border-dashed border-border bg-background flex items-center justify-center cursor-pointer overflow-hidden hover:border-primary transition-colors"
                      onClick={() => fileRefs.current[i]?.click()}
                      title="Klikněte pro nahrání obrázku"
                    >
                      {uploading[i] ? (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      ) : card?.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={card.imageUrl} alt={`Karta ${i}`} className="h-full w-full object-cover" />
                      ) : (
                        <ImageIcon className="h-5 w-5 text-muted-foreground/50" />
                      )}
                      <div className="absolute inset-0 flex items-end justify-center bg-black/0 hover:bg-black/20 transition-colors">
                        <Upload className="mb-1 h-3 w-3 text-white opacity-0 hover:opacity-100" />
                      </div>
                    </div>
                    <input
                      ref={(el) => { fileRefs.current[i] = el }}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileChange(i, e.target.files?.[0] ?? null)}
                    />
                    <p className="mt-1 text-center text-[10px] text-muted-foreground">Obrázek</p>
                  </div>

                  {/* Message input */}
                  <div className="flex-1 space-y-2">
                    <textarea
                      value={getMessage(i)}
                      onChange={(e) => handleMessageChange(i, e.target.value)}
                      placeholder="Zadejte vzkaz ke kartě…"
                      rows={3}
                      className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                    />
                    <button
                      onClick={() => handleSaveMessage(i)}
                      disabled={saving[i]}
                      className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
                    >
                      {saving[i] ? (
                        <><Loader2 className="h-3 w-3 animate-spin" /> Ukládám…</>
                      ) : savedIds.has(i) ? (
                        <><Check className="h-3 w-3" /> Uloženo</>
                      ) : (
                        "Uložit vzkaz"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
