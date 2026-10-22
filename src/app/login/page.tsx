import { Suspense } from "react"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/session"
import { LoginForm } from "@/components/auth/login-form"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Sign In | Applynto",
  description: "Sign in to your Applynto account to track applications and interviews.",
}

export default async function LoginPage() {
  const user = await getCurrentUser()
  if (user) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-12">
      <Suspense fallback={<div className="text-sm text-muted-foreground">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
