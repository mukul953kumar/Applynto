import { WorkMode } from "@prisma/client"

export interface StudentProfileForMatch {
  skills: string[]
  preferredRoles: string[]
  preferredWorkModes: WorkMode[]
  preferredLocations: string[]
  graduationYear: number | null
  degree: string | null
  branch: string | null
  minimumStipend: number | null
}

export interface InternshipListingForMatch {
  id: string
  title: string
  requiredSkills: string[]
  preferredSkills: string[]
  workMode: WorkMode | string
  location: string | null
  eligibleGraduationYears: number[]
  eligibleDegrees: string[]
  eligibleBranches: string[]
  stipendMin: number | null
  stipendMax: number | null
}

export interface MatchResult {
  score: number
  tier: "STRONG" | "GOOD" | "MODERATE" | "LOW"
  matchingSkills: string[]
  missingSkills: string[]
  isGradYearEligible: boolean
  isWorkModeMatch: boolean
  isRoleMatch: boolean
  stipendMeetsExpectation: boolean
}

export function calculateMatchScore(
  student: StudentProfileForMatch | null,
  internship: InternshipListingForMatch
): MatchResult {
  if (!student) {
    return {
      score: 0,
      tier: "LOW",
      matchingSkills: [],
      missingSkills: internship.requiredSkills,
      isGradYearEligible: true,
      isWorkModeMatch: false,
      isRoleMatch: false,
      stipendMeetsExpectation: true,
    }
  }

  const normalizedStudentSkills = new Set(
    student.skills.map((s) => s.toLowerCase().trim())
  )

  const matchingSkills: string[] = []
  const missingSkills: string[] = []

  internship.requiredSkills.forEach((req) => {
    const norm = req.toLowerCase().trim()
    if (normalizedStudentSkills.has(norm)) {
      matchingSkills.push(req)
    } else {
      missingSkills.push(req)
    }
  })

  let skillPoints = 0
  if (internship.requiredSkills.length > 0) {
    const ratio = matchingSkills.length / internship.requiredSkills.length
    skillPoints += ratio * 32
  } else {
    skillPoints += 25
  }

  let preferredSkillBonus = 0
  internship.preferredSkills.forEach((pref) => {
    const norm = pref.toLowerCase().trim()
    if (normalizedStudentSkills.has(norm)) {
      matchingSkills.push(pref)
      preferredSkillBonus += 4
    }
  })
  skillPoints += Math.min(8, preferredSkillBonus)

  let rolePoints = 0
  const normalizedTitle = internship.title.toLowerCase()
  let isRoleMatch = false

  if (student.preferredRoles.length === 0) {
    rolePoints = 15
  } else {
    for (const role of student.preferredRoles) {
      const normRole = role.toLowerCase().trim()
      const roleTokens = normRole.split(/\s+/)
      const hasAnyToken = roleTokens.some((tok) => tok.length > 2 && normalizedTitle.includes(tok))
      if (normalizedTitle.includes(normRole) || hasAnyToken) {
        rolePoints = 25
        isRoleMatch = true
        break
      }
    }
  }

  let workModePoints = 0
  let isWorkModeMatch = false

  if (student.preferredWorkModes.length === 0) {
    workModePoints += 8
    isWorkModeMatch = true
  } else if (student.preferredWorkModes.includes(internship.workMode as WorkMode)) {
    workModePoints += 10
    isWorkModeMatch = true
  }

  if (
    internship.workMode === WorkMode.REMOTE ||
    student.preferredLocations.length === 0 ||
    student.preferredLocations.some(
      (loc) =>
        loc.toLowerCase().trim() === "remote" ||
        (internship.location && internship.location.toLowerCase().includes(loc.toLowerCase().trim()))
    )
  ) {
    workModePoints += 5
  }

  let gradYearPoints = 0
  let isGradYearEligible = true

  if (
    internship.eligibleGraduationYears.length === 0 ||
    !student.graduationYear ||
    internship.eligibleGraduationYears.includes(student.graduationYear)
  ) {
    gradYearPoints = 10
    isGradYearEligible = true
  } else {
    gradYearPoints = 0
    isGradYearEligible = false
  }

  let degreePoints = 0
  if (
    internship.eligibleDegrees.length === 0 ||
    !student.degree ||
    internship.eligibleDegrees.some(
      (deg) => student.degree && deg.toLowerCase().includes(student.degree.toLowerCase())
    )
  ) {
    degreePoints = 10
  } else {
    degreePoints = 4
  }

  const rawScore = skillPoints + rolePoints + workModePoints + gradYearPoints + degreePoints
  const score = Math.max(0, Math.min(100, Math.round(rawScore)))

  let tier: "STRONG" | "GOOD" | "MODERATE" | "LOW" = "LOW"
  if (score >= 75) {
    tier = "STRONG"
  } else if (score >= 55) {
    tier = "GOOD"
  } else if (score >= 35) {
    tier = "MODERATE"
  }

  const stipendMeetsExpectation =
    !student.minimumStipend ||
    !internship.stipendMin ||
    (internship.stipendMax ? internship.stipendMax >= student.minimumStipend : internship.stipendMin >= student.minimumStipend)

  return {
    score,
    tier,
    matchingSkills,
    missingSkills,
    isGradYearEligible,
    isWorkModeMatch,
    isRoleMatch,
    stipendMeetsExpectation,
  }
}
