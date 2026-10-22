import { requireAdmin } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { ReportActions } from "@/components/admin/report-actions"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ExternalLink } from "lucide-react"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Reports Queue | Admin | Applynto",
  description: "Review and resolve user-reported internship listings.",
}

export default async function AdminReportsPage() {
  await requireAdmin()

  const reports = await prisma.internshipReport.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      internship: {
        select: { id: true, title: true, companyName: true },
      },
      user: {
        select: { name: true, email: true },
      },
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reported Listings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Review community reports regarding broken links, outdated deadlines, or suspicious opportunities.
        </p>
      </div>

      <div className="bg-card border border-border/80 rounded-lg overflow-hidden shadow-2xs">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 text-xs">
              <TableHead className="font-semibold">Listing</TableHead>
              <TableHead className="font-semibold">Reporter</TableHead>
              <TableHead className="font-semibold">Reason</TableHead>
              <TableHead className="font-semibold">Description</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-xs text-muted-foreground">
                  No pending listing reports. Platform quality is high!
                </TableCell>
              </TableRow>
            ) : (
              reports.map((report) => (
                <TableRow key={report.id} className="text-xs">
                  <TableCell>
                    <div className="flex flex-col">
                      <Link
                        href={`/internships/${report.internship.id}`}
                        target="_blank"
                        className="font-semibold text-foreground hover:underline inline-flex items-center gap-1"
                      >
                        <span>{report.internship.title}</span>
                        <ExternalLink className="h-3 w-3 text-muted-foreground" />
                      </Link>
                      <span className="text-muted-foreground">{report.internship.companyName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {report.user.name || report.user.email}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px]">
                      {report.reason.replace(/_/g, " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[240px] truncate text-muted-foreground">
                    {report.description || "-"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={report.status === "RESOLVED" ? "secondary" : "outline"}
                      className={`text-[10px] ${
                        report.status === "RESOLVED"
                          ? "text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                          : report.status === "PENDING"
                          ? "text-amber-700 dark:text-amber-400 bg-amber-500/10 border-amber-500/20"
                          : ""
                      }`}
                    >
                      {report.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {report.status === "PENDING" ? (
                      <ReportActions reportId={report.id} />
                    ) : (
                      <span className="text-[11px] text-muted-foreground">Closed</span>
                    )}
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
