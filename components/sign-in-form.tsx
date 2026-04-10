"use client"

import { useAuthActions } from "@convex-dev/auth/react"
import { useState } from "react"

export function SignInForm() {
  const { signIn } = useAuthActions()
  const [step, setStep] = useState<"email" | "code">("email")
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    try {
      const formData = new FormData(e.currentTarget)
      setEmail(formData.get("email") as string)
      await signIn("resend-otp", formData)
      setStep("code")
    } catch {
      setError("Nepodařilo se odeslat kód. Zkuste to znovu.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCodeSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    try {
      const formData = new FormData(e.currentTarget)
      await signIn("resend-otp", formData)
    } catch {
      setError("Neplatný kód. Zkuste to znovu.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-sm space-y-6 rounded-xl border border-border bg-card p-8 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-foreground">Karty Tvůrkyně</h1>
          <p className="text-sm text-muted-foreground">Administrace</p>
        </div>

        {step === "code" ? (
          <form onSubmit={handleCodeSubmit} className="space-y-4">
            <div className="space-y-1">
              <p className="text-sm text-foreground">
                Kód byl odeslán na <span className="font-medium">{email}</span>
              </p>
              <p className="text-xs text-muted-foreground">Zadejte 6místný kód z e-mailu.</p>
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
            <input name="email" value={email} type="hidden" readOnly />
            <input
              name="code"
              type="text"
              inputMode="numeric"
              pattern="\d{6}"
              placeholder="000000"
              required
              disabled={isLoading}
              autoFocus
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-center text-2xl tracking-[0.5em] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {isLoading ? "Ověřuji…" : "Potvrdit kód"}
            </button>
            <button
              type="button"
              onClick={() => { setStep("email"); setError(null) }}
              disabled={isLoading}
              className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Zadat jiný e-mail
            </button>
          </form>
        ) : (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">E-mail</label>
              <input
                name="email"
                type="email"
                placeholder="vas@email.cz"
                required
                disabled={isLoading}
                autoFocus
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {isLoading ? "Odesílám kód…" : "Poslat kód"}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
