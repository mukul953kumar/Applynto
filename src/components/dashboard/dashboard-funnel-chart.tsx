"use client"

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3 } from "lucide-react"

interface FunnelDataPoint {
  stage: string
  count: number
  fill: string
}

interface DashboardFunnelChartProps {
  data: FunnelDataPoint[]
}

export function DashboardFunnelChart({ data }: DashboardFunnelChartProps) {
  const totalCount = data.reduce((sum, item) => sum + item.count, 0)

  return (
    <Card className="border-border/80 shadow-2xs">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            Application Funnel & Pipeline Distribution
          </CardTitle>
          <span className="text-xs text-muted-foreground font-medium">
            {totalCount} Total Tracked
          </span>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        {totalCount === 0 ? (
          <div className="h-48 flex items-center justify-center text-xs text-muted-foreground border border-dashed rounded-lg">
            Track applications to view pipeline conversion funnel
          </div>
        ) : (
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <XAxis
                  dataKey="stage"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "currentColor" }}
                  className="text-muted-foreground"
                />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "currentColor" }}
                  className="text-muted-foreground"
                />
                <Tooltip
                  cursor={{ fill: "rgba(100, 116, 139, 0.08)" }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload as FunnelDataPoint
                      return (
                        <div className="rounded-lg border border-border bg-card p-2 shadow-md text-xs">
                          <p className="font-semibold text-foreground">{d.stage}</p>
                          <p className="text-muted-foreground mt-0.5">
                            {d.count} {d.count === 1 ? "application" : "applications"}
                          </p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
