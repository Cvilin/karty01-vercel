import Link from "next/link"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
      <h1 className="text-2xl font-semibold text-foreground">Karty Tvůrkyně</h1>
      <p className="text-sm text-muted-foreground">Interaktivní e-learningový widget</p>
      <Link
        href="/admin"
        className="rounded-lg border border-border bg-card px-4 py-2 text-sm text-foreground shadow-sm hover:bg-muted transition-colors"
      >
        Přejít do administrace →
      </Link>
    </div>
  )
}
