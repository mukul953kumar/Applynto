import { requireAdmin } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
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
  title: "Audit Logs | Admin | Applynto",
  description: "Review administrative actions and platform audit logs.",
}

export default async function AdminAuditLogsPage() {
  await requireAdmin()

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      actor: {
        select: { name: true, email: true },
      },
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Audit Trail</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Immutable audit record of sensitive administrative actions and data modifications.
        </p>
      </div>

      <div className="bg-card border border-border/80 rounded-lg overflow-hidden shadow-2xs">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 text-xs">
              <TableHead className="font-semibold">Action</TableHead>
              <TableHead className="font-semibold">Entity Type</TableHead>
              <TableHead className="font-semibold">Actor</TableHead>
              <TableHead className="font-semibold">Details</TableHead>
              <TableHead className="font-semibold text-right">Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-xs text-muted-foreground">
                  No administrative actions logged yet.
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id} className="text-xs">
                  <TableCell className="font-medium">
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{log.entityType}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {log.actor.name || log.actor.email}
                  </TableCell>
                  <TableCell className="max-w-[320px] truncate font-mono text-[11px] text-muted-foreground">
                    {log.details || "-"}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {new Date(log.createdAt).toLocaleDateString("en-IN", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
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
