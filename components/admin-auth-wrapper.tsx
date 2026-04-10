"use client"

import { Authenticated, Unauthenticated, AuthLoading } from "convex/react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { SignInForm } from "./sign-in-form"

export function AdminAuthWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AuthLoading>
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="text-sm text-muted-foreground">Načítám…</div>
        </div>
      </AuthLoading>
      <Authenticated>
        <AdminGuard>{children}</AdminGuard>
      </Authenticated>
      <Unauthenticated>
        <SignInForm />
      </Unauthenticated>
    </>
  )
}

function AdminGuard({ children }: { children: React.ReactNode }) {
  const isAdmin = useQuery(api.users.isAdmin)

  if (isAdmin === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-sm text-muted-foreground">Ověřuji přístup…</div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="rounded-xl border border-border bg-card p-8 text-center shadow-sm">
          <p className="text-sm font-medium text-destructive">Přístup odmítnut</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Váš e-mail nemá přístup do administrace.
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
