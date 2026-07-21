// Types mirroring the Member 3 (Candidate + Recruitment) API DTOs.

// Const-object "enums" (erasable syntax — required by TypeScript's erasableSyntaxOnly).

export const EmploymentType = {
  FullTime: 1,
  PartTime: 2,
  Contract: 3,
  Internship: 4,
  Temporary: 5,
} as const
export type EmploymentType = (typeof EmploymentType)[keyof typeof EmploymentType]

export const JobPostingStatus = {
  Draft: 1,
  Published: 2,
  Closed: 3,
} as const
export type JobPostingStatus = (typeof JobPostingStatus)[keyof typeof JobPostingStatus]

export const ApplicationStage = {
  Applied: 1,
  Screening: 2,
  Shortlisted: 3,
  InterviewScheduled: 4,
  Interviewed: 5,
  Offered: 6,
  Hired: 7,
  Rejected: 8,
} as const
export type ApplicationStage = (typeof ApplicationStage)[keyof typeof ApplicationStage]

export const EmploymentTypeLabels: Record<EmploymentType, string> = {
  [EmploymentType.FullTime]: 'Full time',
  [EmploymentType.PartTime]: 'Part time',
  [EmploymentType.Contract]: 'Contract',
  [EmploymentType.Internship]: 'Internship',
  [EmploymentType.Temporary]: 'Temporary',
}

export const ApplicationStageLabels: Record<ApplicationStage, string> = {
  [ApplicationStage.Applied]: 'Applied',
  [ApplicationStage.Screening]: 'Screening',
  [ApplicationStage.Shortlisted]: 'Shortlisted',
  [ApplicationStage.InterviewScheduled]: 'Interview scheduled',
  [ApplicationStage.Interviewed]: 'Interviewed',
  [ApplicationStage.Offered]: 'Offered',
  [ApplicationStage.Hired]: 'Hired',
  [ApplicationStage.Rejected]: 'Rejected',
}

export interface CandidateProfile {
  id: string
  userId: string
  professionalSummary: string
  resumeBlobUrl: string | null
  yearsOfExperience: number
  skillIds: string[]
  createdAt: string
  updatedAt: string
}

export interface JobPosting {
  id: string
  organizationId: string
  recruiterId: string
  title: string
  description: string
  location: string
  employmentType: EmploymentType
  status: JobPostingStatus
  minExperienceYears: number
  skillIds: string[]
  createdAt: string
  publishedAt: string | null
  closedAt: string | null
}

export interface JobSearchFilters {
  title?: string
  skillId?: string
  location?: string
  employmentType?: EmploymentType
}

export interface ApplicationStageHistory {
  fromStage: ApplicationStage
  toStage: ApplicationStage
  changedAt: string
  changedByUserId: string | null
  note: string | null
}

export interface ApplicationSummary {
  id: string
  jobPostingId: string
  candidateProfileId: string
  stage: ApplicationStage
  aiMatchScore: number | null
  appliedAt: string
  updatedAt: string
}

export interface ApplicationDetail extends ApplicationSummary {
  stageHistory: ApplicationStageHistory[]
}
