"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react"

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const registered = searchParams.get("registered")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    if (!res || res.error) {
      setError("Invalid email or password. Please check your credentials.")
      setLoading(false)
      return
    }

    router.push("/dashboard")
    router.refresh()
  }

  return (
    <Card className="w-full max-w-md border-border/80 shadow-xs">
      <CardHeader className="space-y-1.5 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-semibold text-sm">
            A
          </div>
          <span className="font-semibold text-lg tracking-tight">Applynto</span>
        </div>
        <CardTitle className="text-xl font-semibold">Welcome back</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Enter your credentials to access your applications and reminders.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {registered && (
            <div className="flex items-center gap-2 rounded-md bg-emerald-500/10 border border-emerald-500/20 p-3 text-sm text-emerald-700 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              Account created successfully. Please sign in below.
            </div>
          )}

          {error && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive font-medium">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="email">
              Email address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="student@college.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              autoComplete="email"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="password">
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              autoComplete="current-password"
            />
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 pt-2">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Signing in...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Sign in <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Don&apos;t have an account yet?{" "}
            <Link href="/signup" className="font-medium text-primary hover:underline">
              Create one
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
