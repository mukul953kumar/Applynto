"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/session"
import {
  createInternshipSchema,
  CreateInternshipInput,
} from "@/lib/validations/internship"
import { ListingStatus, ReportStatus, SourceType, VerificationStatus, WorkMode } from "@prisma/client"
import { ActionResult } from "@/actions/auth"

export async function createAdminInternship(
  input: CreateInternshipInput
): Promise<ActionResult<{ id: string }>> {
  const admin = await requireAdmin()

  const parsed = createInternshipSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Validation failed",
    }
  }

  const data = parsed.data
  const deadlineDate = data.deadline ? new Date(data.deadline) : null

  const record = await prisma.internship.create({
    data: {
      title: data.title.trim(),
      companyName: data.companyName.trim(),
      companyWebsite: data.companyWebsite || null,
      companyLogoUrl: data.companyLogoUrl || null,
      shortDescription: data.shortDescription.trim(),
      description: data.description.trim(),
      responsibilities: data.responsibilities?.trim() || null,
      requiredSkills: data.requiredSkills,
      preferredSkills: data.preferredSkills,
      eligibleDegrees: data.eligibleDegrees,
      eligibleBranches: data.eligibleBranches,
      eligibleGraduationYears: data.eligibleGraduationYears,
      location: data.location?.trim() || null,
      workMode: data.workMode,
      stipendMin: data.stipendMin || null,
      stipendMax: data.stipendMax || null,
      currency: data.currency || "INR",
      duration: data.duration?.trim() || null,
      deadline: deadlineDate,
      publishedAt: data.status === ListingStatus.PUBLISHED ? new Date() : null,
      officialApplyUrl: data.officialApplyUrl,
      sourceUrl: data.sourceUrl || null,
      sourceType: data.sourceType,
      verificationStatus: data.verificationStatus,
      lastVerifiedAt: data.verificationStatus === VerificationStatus.VERIFIED ? new Date() : null,
      verifiedById: data.verificationStatus === VerificationStatus.VERIFIED ? admin.id : null,
      status: data.status,
      createdById: admin.id,
    },
  })

  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: "CREATE_INTERNSHIP",
      entityType: "INTERNSHIP",
      entityId: record.id,
      details: JSON.stringify({ title: record.title, company: record.companyName }),
    },
  })

  revalidatePath("/internships")
  revalidatePath("/admin/internships")
  return { success: true, data: { id: record.id } }
}

export async function toggleListingStatus(
  id: string,
  newStatus: ListingStatus
): Promise<ActionResult> {
  const admin = await requireAdmin()

  await prisma.internship.update({
    where: { id },
    data: {
      status: newStatus,
      publishedAt: newStatus === ListingStatus.PUBLISHED ? new Date() : undefined,
    },
  })

  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: "UPDATE_LISTING_STATUS",
      entityType: "INTERNSHIP",
      entityId: id,
      details: JSON.stringify({ newStatus }),
    },
  })

  revalidatePath("/internships")
  revalidatePath("/admin/internships")
  return { success: true }
}

export async function toggleListingVerification(
  id: string,
  newStatus: VerificationStatus
): Promise<ActionResult> {
  const admin = await requireAdmin()

  await prisma.internship.update({
    where: { id },
    data: {
      verificationStatus: newStatus,
      lastVerifiedAt: newStatus === VerificationStatus.VERIFIED ? new Date() : undefined,
      verifiedById: newStatus === VerificationStatus.VERIFIED ? admin.id : undefined,
    },
  })

  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: "UPDATE_LISTING_VERIFICATION",
      entityType: "INTERNSHIP",
      entityId: id,
      details: JSON.stringify({ newStatus }),
    },
  })

  revalidatePath("/internships")
  revalidatePath("/admin/internships")
  return { success: true }
}

export type CsvImportRow = {
  title: string
  companyName: string
  officialApplyUrl: string
  shortDescription?: string
  description?: string
  workMode?: string
  location?: string
  stipendMin?: number
  requiredSkills?: string
  deadline?: string
}

export async function importInternshipsFromData(
  fileName: string,
  rows: CsvImportRow[]
): Promise<ActionResult<{ successful: number; failed: number }>> {
  const admin = await requireAdmin()

  if (!rows || rows.length === 0) {
    return { success: false, error: "No records found in import data" }
  }

  let successful = 0
  let failed = 0

  const batch = await prisma.importBatch.create({
    data: {
      adminId: admin.id,
      fileName,
      status: "PROCESSING",
      totalRows: rows.length,
    },
  })

  for (const row of rows) {
    try {
      if (!row.title || !row.companyName || !row.officialApplyUrl) {
        failed++
        continue
      }

      if (!row.officialApplyUrl.startsWith("https://")) {
        failed++
        continue
      }

      const skills = row.requiredSkills
        ? row.requiredSkills.split(",").map((s) => s.trim()).filter(Boolean)
        : ["General"]

      const workModeMap: Record<string, WorkMode> = {
        remote: WorkMode.REMOTE,
        hybrid: WorkMode.HYBRID,
        onsite: WorkMode.ON_SITE,
        "on-site": WorkMode.ON_SITE,
      }
      const modeKey = (row.workMode || "").toLowerCase().trim()
      const workMode = workModeMap[modeKey] || WorkMode.NOT_SPECIFIED

      await prisma.internship.create({
        data: {
          title: row.title.trim(),
          companyName: row.companyName.trim(),
          shortDescription: row.shortDescription?.trim() || `${row.title} opportunity at ${row.companyName}`,
          description: row.description?.trim() || `${row.title} role at ${row.companyName}. Apply directly on their official careers site.`,
          officialApplyUrl: row.officialApplyUrl.trim(),
          workMode,
          location: row.location?.trim() || null,
          stipendMin: row.stipendMin || null,
          requiredSkills: skills,
          deadline: row.deadline ? new Date(row.deadline) : null,
          sourceType: SourceType.CSV_IMPORT,
          verificationStatus: VerificationStatus.VERIFIED,
          lastVerifiedAt: new Date(),
          verifiedById: admin.id,
          status: ListingStatus.PUBLISHED,
          publishedAt: new Date(),
          createdById: admin.id,
        },
      })
      successful++
    } catch {
      failed++
    }
  }

  await prisma.importBatch.update({
    where: { id: batch.id },
    data: {
      status: "COMPLETED",
      successfulRows: successful,
      failedRows: failed,
      completedAt: new Date(),
    },
  })

  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: "IMPORT_CSV",
      entityType: "IMPORT_BATCH",
      entityId: batch.id,
      details: JSON.stringify({ fileName, successful, failed }),
    },
  })

  revalidatePath("/internships")
  revalidatePath("/admin/internships")
  revalidatePath("/admin/imports")

  return { success: true, data: { successful, failed } }
}

export async function resolveListingReport(
  reportId: string,
  newStatus: ReportStatus,
  resolutionNote?: string
): Promise<ActionResult> {
  const admin = await requireAdmin()

  await prisma.internshipReport.update({
    where: { id: reportId },
    data: {
      status: newStatus,
      reviewedById: admin.id,
      reviewedAt: new Date(),
      resolutionNote: resolutionNote?.trim() || null,
    },
  })

  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: "RESOLVE_REPORT",
      entityType: "INTERNSHIP_REPORT",
      entityId: reportId,
      details: JSON.stringify({ status: newStatus }),
    },
  })

  revalidatePath("/admin/reports")
  return { success: true }
}
