import { requireAdmin } from "@/lib/session"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"

export const dynamic = "force-dynamic"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const admin = await requireAdmin()

  return (
    <div className="flex min-h-screen bg-muted/20">
      <div className="hidden md:flex w-60 shrink-0 flex-col fixed inset-y-0 z-50">
        <Sidebar userRole={admin.role} />
      </div>

      <div className="flex-1 flex flex-col md:pl-60 min-w-0">
        <Header user={admin} />
        <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  )
}
