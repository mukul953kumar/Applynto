import { requireAdmin } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { CsvImporter } from "@/components/admin/csv-importer"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "CSV Bulk Imports | Admin | Applynto",
  description: "Upload and review bulk internship data imports.",
}

export default async function AdminImportsPage() {
  await requireAdmin()

  const batches = await prisma.importBatch.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      admin: {
        select: { name: true, email: true },
      },
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">CSV Imports</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Bulk import verified internship listings from structured spreadsheets.
        </p>
      </div>

      <CsvImporter />

      <Card className="border-border/80 shadow-2xs">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Import History</CardTitle>
          <CardDescription className="text-xs">
            Past import batches and row success statistics.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 text-xs">
                <TableHead className="font-semibold">File / Batch</TableHead>
                <TableHead className="font-semibold">Imported By</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold text-center">Total Rows</TableHead>
                <TableHead className="font-semibold text-center">Successful</TableHead>
                <TableHead className="font-semibold text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {batches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-xs text-muted-foreground">
                    No import history yet.
                  </TableCell>
                </TableRow>
              ) : (
                batches.map((b) => (
                  <TableRow key={b.id} className="text-xs">
                    <TableCell className="font-medium">{b.fileName}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {b.admin.name || b.admin.email}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={b.status === "COMPLETED" ? "secondary" : "outline"}
                        className={`text-[10px] ${
                          b.status === "COMPLETED"
                            ? "text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                            : ""
                        }`}
                      >
                        {b.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">{b.totalRows}</TableCell>
                    <TableCell className="text-center font-medium text-emerald-600">
                      {b.successfulRows}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {new Date(b.createdAt).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
