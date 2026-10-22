"use server"

import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/session"
import { ApplicationStatus, InterviewStatus, ReminderStatus } from "@prisma/client"

export async function getDashboardData() {
  const user = await requireAuth()
  const now = new Date()
  const in48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000)
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  const [
    applications,
    upcomingInterviews,
    pendingReminders,
    allReminders,
    allInterviews,
  ] = await Promise.all([
    prisma.application.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      include: {
        history: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    }),
    prisma.interview.findMany({
      where: {
        userId: user.id,
        scheduledAt: { gte: now },
        status: InterviewStatus.SCHEDULED,
      },
      orderBy: { scheduledAt: "asc" },
      take: 4,
      include: {
        application: {
          select: {
            id: true,
            companyName: true,
            roleTitle: true,
          },
        },
      },
    }),
    prisma.reminder.findMany({
      where: {
        userId: user.id,
        status: ReminderStatus.PENDING,
        dueAt: { lte: in48Hours },
      },
      orderBy: { dueAt: "asc" },
      take: 5,
      include: {
        application: {
          select: {
            id: true,
            companyName: true,
            roleTitle: true,
          },
        },
      },
    }),
    prisma.reminder.count({
      where: {
        userId: user.id,
        status: ReminderStatus.PENDING,
      },
    }),
    prisma.interview.count({
      where: {
        userId: user.id,
      },
    }),
  ])

  const totalApplications = applications.length
  const savedCount = applications.filter((a) => a.status === ApplicationStatus.SAVED).length
  const appliedCount = applications.filter((a) => a.status === ApplicationStatus.APPLIED).length
  const assessmentCount = applications.filter((a) => a.status === ApplicationStatus.ASSESSMENT).length
  const interviewCount = applications.filter((a) => a.status === ApplicationStatus.INTERVIEW).length
  const offerCount = applications.filter((a) => a.status === ApplicationStatus.OFFER).length
  const rejectedCount = applications.filter((a) => a.status === ApplicationStatus.REJECTED).length
  const withdrawnCount = applications.filter((a) => a.status === ApplicationStatus.WITHDRAWN).length
  const onHoldCount = applications.filter((a) => a.status === ApplicationStatus.ON_HOLD).length

  const activePipelineCount = appliedCount + assessmentCount + interviewCount + onHoldCount

  const nonSavedCount = totalApplications - savedCount
  const progressCount = assessmentCount + interviewCount + offerCount
  const conversionRate = nonSavedCount > 0 ? Math.round((progressCount / nonSavedCount) * 100) : 0
  const offerRate = nonSavedCount > 0 ? Math.round((offerCount / nonSavedCount) * 100) : 0

  const stageFunnelData = [
    { stage: "Saved", count: savedCount, fill: "#64748b" },
    { stage: "Applied", count: appliedCount, fill: "#3b82f6" },
    { stage: "Assessment", count: assessmentCount, fill: "#6366f1" },
    { stage: "Interview", count: interviewCount, fill: "#f59e0b" },
    { stage: "Offer", count: offerCount, fill: "#10b981" },
    { stage: "Rejected", count: rejectedCount, fill: "#f43f5e" },
  ]

  const overdueActions = applications
    .filter((a) => a.nextAction && a.nextActionAt && new Date(a.nextActionAt) < now)
    .map((a) => ({
      id: a.id,
      type: "APPLICATION_ACTION" as const,
      title: a.nextAction!,
      subtitle: `${a.companyName} • ${a.roleTitle}`,
      dueAt: a.nextActionAt!,
      isOverdue: true,
      link: `/applications/${a.id}`,
    }))

  const focusReminders = pendingReminders.map((r) => ({
    id: r.id,
    type: "REMINDER" as const,
    title: r.title,
    subtitle: r.application ? `${r.application.companyName} • ${r.application.roleTitle}` : "General task",
    dueAt: r.dueAt,
    isOverdue: new Date(r.dueAt) < now,
    link: r.applicationId ? `/applications/${r.applicationId}` : "/reminders",
  }))

  const focusInterviews = upcomingInterviews.map((i) => ({
    id: i.id,
    type: "INTERVIEW" as const,
    title: i.roundName || i.type.replace(/_/g, " "),
    subtitle: `${i.application.companyName} • ${i.application.roleTitle}`,
    dueAt: i.scheduledAt,
    isOverdue: false,
    link: `/interviews`,
  }))

  const focusItems = [...overdueActions, ...focusReminders, ...focusInterviews]
    .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime())
    .slice(0, 6)

  return {
    metrics: {
      totalApplications,
      activePipelineCount,
      upcomingInterviewsCount: upcomingInterviews.length,
      totalInterviewsCount: allInterviews,
      pendingRemindersCount: allReminders,
      offersCount: offerCount,
      conversionRate,
      offerRate,
    },
    stageFunnelData,
    focusItems,
    upcomingInterviews,
    recentApplications: applications.slice(0, 5),
  }
}
