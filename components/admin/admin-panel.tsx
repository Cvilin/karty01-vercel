"use client"

import { useAuthActions } from "@convex-dev/auth/react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useState } from "react"
import { CardsManager } from "./cards-manager"
import { LessonsManager } from "./lessons-manager"
import { LogOut, LayoutGrid, BookOpen } from "lucide-react"

type Tab = "cards" | "lessons"

export function AdminPanel() {
  const { signOut } = useAuthActions()
  const user = useQuery(api.users.currentLoggedInUser)
  const [tab, setTab] = useState<Tab>("cards")

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-10 border-b border-border bg-card/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-2">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-foreground">Karty Tvůrkyně</span>
            <span className="text-xs text-muted-foreground">Admin</span>
          </div>
          <div className="flex items-center gap-3">
            {user?.email && (
              <span className="hidden text-xs text-muted-foreground sm:block">{user.email}</span>
            )}
            <button
              onClick={() => void signOut()}
              className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs text-muted-foreground hover:border-destructive hover:text-destructive transition-colors"
            >
              <LogOut className="h-3 w-3" />
              Odhlásit
            </button>
          </div>
        </div>
      </header>

      {/* Tab navigation */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-4xl gap-1 px-4">
          <button
            onClick={() => setTab("cards")}
            className={`flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-xs font-medium transition-colors ${
              tab === "cards"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            Karty (0–64)
          </button>
          <button
            onClick={() => setTab("lessons")}
            className={`flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-xs font-medium transition-colors ${
              tab === "lessons"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            Lekce
          </button>
        </div>
      </div>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-4 py-4">
        {tab === "cards" && <CardsManager />}
        {tab === "lessons" && <LessonsManager />}
      </main>
    </div>
  )
}
