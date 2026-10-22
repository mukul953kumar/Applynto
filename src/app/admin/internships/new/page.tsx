import { requireAdmin } from "@/lib/session"
import { NewListingForm } from "@/components/admin/new-listing-form"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "New Internship Listing | Admin | Applynto",
  description: "Publish a new verified internship opportunity.",
}

export default async function NewListingPage() {
  await requireAdmin()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Create Listing</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Enter verified opportunity information to publish to students.
        </p>
      </div>

      <NewListingForm />
    </div>
  )
}
