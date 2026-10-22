"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { registerUser } from "@/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Loader2, Sparkles } from "lucide-react"

export function SignupForm() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const result = await registerUser({ name, email, password })
    if (!result.success) {
      setError(result.error || "Failed to create account")
      setLoading(false)
      return
    }

    router.push("/login?registered=true")
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
        <CardTitle className="text-xl font-semibold">Create your account</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Track internships, manage interview rounds, and stay ahead of deadlines.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive font-medium">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="name">
              Full name
            </label>
            <Input
              id="name"
              type="text"
              placeholder="e.g. Mukul Kumar"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
              autoComplete="name"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="email">
              College or personal email
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
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              disabled={loading}
              autoComplete="new-password"
            />
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 pt-2">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Creating account...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Get started <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
