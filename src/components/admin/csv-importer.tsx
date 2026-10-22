"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CsvImportRow, importInternshipsFromData } from "@/actions/admin-internships"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle2, FileUp, Loader2, UploadCloud } from "lucide-react"

export function CsvImporter() {
  const router = useRouter()
  const [csvContent, setCsvContent] = useState("")
  const [parsedRows, setParsedRows] = useState<CsvImportRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{ successful: number; failed: number } | null>(null)

  function parseCsv(text: string) {
    setError(null)
    setResult(null)

    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean)
    if (lines.length < 2) {
      setError("CSV must contain a header row and at least one data row")
      return
    }

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase())
    const titleIdx = headers.indexOf("title")
    const companyIdx = headers.indexOf("companyname") !== -1 ? headers.indexOf("companyname") : headers.indexOf("company")
    const urlIdx = headers.indexOf("officialapplyurl") !== -1 ? headers.indexOf("officialapplyurl") : headers.indexOf("url")
    const modeIdx = headers.indexOf("workmode")
    const locIdx = headers.indexOf("location")
    const stipendIdx = headers.indexOf("stipendmin") !== -1 ? headers.indexOf("stipendmin") : headers.indexOf("stipend")
    const skillsIdx = headers.indexOf("requiredskills") !== -1 ? headers.indexOf("requiredskills") : headers.indexOf("skills")
    const deadlineIdx = headers.indexOf("deadline")

    if (titleIdx === -1 || companyIdx === -1 || urlIdx === -1) {
      setError("CSV must have 'title', 'companyName' (or 'company'), and 'officialApplyUrl' (or 'url') headers")
      return
    }

    const rows: CsvImportRow[] = []

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(",").map((c) => c.trim().replace(/^"|"$/g, ""))
      if (cols.length < 3) continue

      const title = cols[titleIdx] || ""
      const companyName = cols[companyIdx] || ""
      const officialApplyUrl = cols[urlIdx] || ""

      if (!title || !companyName || !officialApplyUrl) continue

      rows.push({
        title,
        companyName,
        officialApplyUrl,
        workMode: modeIdx !== -1 ? cols[modeIdx] : undefined,
        location: locIdx !== -1 ? cols[locIdx] : undefined,
        stipendMin: stipendIdx !== -1 && cols[stipendIdx] ? parseInt(cols[stipendIdx], 10) : undefined,
        requiredSkills: skillsIdx !== -1 ? cols[skillsIdx] : undefined,
        deadline: deadlineIdx !== -1 ? cols[deadlineIdx] : undefined,
      })
    }

    if (rows.length === 0) {
      setError("No valid rows could be extracted from the provided text")
      return
    }

    setParsedRows(rows)
  }

  async function handleImport() {
    if (parsedRows.length === 0) return

    setLoading(true)
    setError(null)

    const res = await importInternshipsFromData("manual-csv-import.csv", parsedRows)
    if (!res.success) {
      setError(res.error || "Failed to import rows")
      setLoading(false)
      return
    }

    setResult(res.data || { successful: parsedRows.length, failed: 0 })
    setParsedRows([])
    setCsvContent("")
    setLoading(false)
    router.refresh()
  }

  function loadSampleCsv() {
    const sample = `title,companyName,officialApplyUrl,workMode,location,stipendMin,requiredSkills,deadline
Full Stack Developer Intern,Zepto,https://careers.zepto.com/jobs/dev-101,Remote,Bengaluru,35000,"React, Node.js, TypeScript",2026-11-15
Data Analyst Intern,Swiggy,https://careers.swiggy.com/jobs/data-202,Hybrid,Bengaluru,30000,"Python, SQL, Tableau",2026-11-20
Frontend Engineering Intern,Groww,https://groww.in/careers/frontend-303,Remote,Bengaluru,40000,"Next.js, Tailwind, TypeScript",2026-11-30
Backend Systems Intern,Cred,https://careers.cred.club/jobs/backend-404,On-site,Bengaluru,50000,"Go, PostgreSQL, Docker",2026-12-05`
    setCsvContent(sample)
    parseCsv(sample)
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/80 shadow-2xs">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">CSV Batch Importer</CardTitle>
              <CardDescription className="text-xs">
                Upload or paste structured internship listings. All records are verified on import.
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={loadSampleCsv} className="h-8 text-xs">
              Load Sample CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded-md bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive font-medium">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {result && (
            <div className="flex items-center gap-2 rounded-md bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-700 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>
                Successfully imported {result.successful} internships! ({result.failed} rows failed or skipped).
              </span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium" htmlFor="csv-input">
              Paste CSV Content (with headers)
            </label>
            <textarea
              id="csv-input"
              rows={6}
              value={csvContent}
              onChange={(e) => {
                setCsvContent(e.target.value)
                if (e.target.value.trim()) {
                  parseCsv(e.target.value)
                } else {
                  setParsedRows([])
                }
              }}
              placeholder={`title,companyName,officialApplyUrl,workMode,location,stipendMin,requiredSkills,deadline\nSoftware Engineering Intern,Google,https://careers.google.com/jobs/1,Remote,Bengaluru,45000,"C++, Java",2026-12-01`}
              className="w-full rounded-md border border-input bg-background p-2.5 font-mono text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          {parsedRows.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-border/60">
              <p className="text-xs font-semibold text-foreground">
                Preview ({parsedRows.length} valid listings ready to import):
              </p>
              <div className="max-h-60 overflow-y-auto rounded-md border border-border">
                <table className="w-full text-[11px] text-left">
                  <thead className="bg-muted text-muted-foreground font-semibold sticky top-0">
                    <tr>
                      <th className="p-2">Role</th>
                      <th className="p-2">Company</th>
                      <th className="p-2">Work Mode</th>
                      <th className="p-2">Stipend</th>
                      <th className="p-2">Application Link</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {parsedRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-muted/30">
                        <td className="p-2 font-medium">{row.title}</td>
                        <td className="p-2">{row.companyName}</td>
                        <td className="p-2">{row.workMode || "Not specified"}</td>
                        <td className="p-2">{row.stipendMin ? `₹${row.stipendMin}/mo` : "-"}</td>
                        <td className="p-2 truncate max-w-[180px] font-mono text-[10px] text-primary">
                          {row.officialApplyUrl}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex items-center justify-between border-t border-border/60 pt-4">
          <span className="text-xs text-muted-foreground">
            {parsedRows.length} rows parsed
          </span>
          <Button
            size="sm"
            onClick={handleImport}
            disabled={loading || parsedRows.length === 0}
            className="text-xs gap-1.5"
          >
            {loading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Importing...</span>
              </>
            ) : (
              <>
                <FileUp className="h-3.5 w-3.5" />
                <span>Import {parsedRows.length} Opportunities</span>
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
