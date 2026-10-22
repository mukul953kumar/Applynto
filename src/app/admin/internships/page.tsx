import { requireAdmin } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { ListingActions } from "@/components/admin/listing-actions"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Briefcase, ExternalLink, Plus, UploadCloud } from "lucide-react"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Manage Listings | Admin | Applynto",
  description: "Create, edit, verify, and pause internship listings.",
}

export default async function AdminInternshipsPage() {
  await requireAdmin()

  const listings = await prisma.internship.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          savedBy: true,
          applications: true,
          reports: true,
        },
      },
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Internship Listings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage opportunities, verify official application links, and monitor student interest.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/imports"
            className={buttonVariants({ variant: "outline", size: "sm", className: "h-8 text-xs gap-1.5" })}
          >
            <UploadCloud className="h-3.5 w-3.5" />
            <span>Import CSV</span>
          </Link>
          <Link
            href="/admin/internships/new"
            className={buttonVariants({ size: "sm", className: "h-8 text-xs gap-1.5" })}
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create Listing</span>
          </Link>
        </div>
      </div>

      <div className="bg-card border border-border/80 rounded-lg overflow-hidden shadow-2xs">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="text-xs font-semibold">Title & Company</TableHead>
              <TableHead className="text-xs font-semibold">Work Mode</TableHead>
              <TableHead className="text-xs font-semibold">Status</TableHead>
              <TableHead className="text-xs font-semibold">Verification</TableHead>
              <TableHead className="text-xs font-semibold text-center">Applications</TableHead>
              <TableHead className="text-xs font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {listings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-xs text-muted-foreground">
                  No listings found. Create your first listing or import from CSV.
                </TableCell>
              </TableRow>
            ) : (
              listings.map((item) => (
                <TableRow key={item.id} className="text-xs">
                  <TableCell>
                    <div className="flex flex-col">
                      <Link
                        href={`/internships/${item.id}`}
                        target="_blank"
                        className="font-semibold text-foreground hover:underline inline-flex items-center gap-1"
                      >
                        <span>{item.title}</span>
                        <ExternalLink className="h-3 w-3 text-muted-foreground" />
                      </Link>
                      <span className="text-muted-foreground">{item.companyName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] font-normal">
                      {item.workMode}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={item.status === "PUBLISHED" ? "default" : "secondary"}
                      className="text-[10px]"
                    >
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={item.verificationStatus === "VERIFIED" ? "secondary" : "outline"}
                      className={`text-[10px] ${
                        item.verificationStatus === "VERIFIED"
                          ? "text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                          : ""
                      }`}
                    >
                      {item.verificationStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center font-medium">
                    {item._count.applications}
                  </TableCell>
                  <TableCell className="text-right">
                    <ListingActions
                      id={item.id}
                      status={item.status}
                      verificationStatus={item.verificationStatus}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
