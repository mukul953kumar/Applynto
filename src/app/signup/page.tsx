import { getCurrentUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { SignupForm } from "@/components/auth/signup-form"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Sign Up | Applynto",
  description: "Create an account to track and organize your internship search.",
}

export default async function SignupPage() {
  const user = await getCurrentUser()
  if (user) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-12">
      <SignupForm />
    </div>
  )
}
