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

export interface CandidateSkill {
  skillId: string
  skillName?: string
  proficiencyLevel?: string
  category?: string
  yearsOfExperience?: number
  lastUsed?: string
}

export interface CandidateExperience {
  id: string
  company: string
  jobTitle: string
  employmentType: string
  location: string
  startDate: string
  endDate?: string | null
  currentlyWorking: boolean
  responsibilities: string
  achievements: string
  technologiesUsed: string
}

export interface CandidateEducation {
  id: string
  institution: string
  degree: string
  fieldOfStudy: string
  gpa: string
  startDate: string
  endDate?: string | null
  description: string
}

export interface CandidateProject {
  id: string
  projectName: string
  description: string
  role: string
  technologies: string
  gitHubUrl: string
  liveDemoUrl: string
  startDate?: string | null
  endDate?: string | null
}

export interface CandidateCertification {
  id: string
  name: string
  organization: string
  issueDate: string
  expiryDate?: string | null
  credentialId: string
  credentialUrl: string
}

export interface CandidateLanguage {
  id: string
  language: string
  readingLevel: string
  writingLevel: string
  speakingLevel: string
}

export interface CandidateAchievement {
  id: string
  title: string
  description: string
  issuedBy: string
  awardDate: string
}

export interface CandidateDocument {
  id: string
  documentType: string
  fileName: string
  blobUrl: string
  uploadedAt: string
}

export interface CandidateProfile {
  id: string
  userId: string
  professionalSummary: string
  resumeBlobUrl: string | null
  yearsOfExperience: number
  skillIds: string[]
  skills: CandidateSkill[]
  createdAt: string
  updatedAt: string

  // Enterprise additions
  preferredName?: string
  profilePictureUrl?: string
  coverPictureUrl?: string
  dateOfBirth?: string
  gender?: string
  nationality?: string
  address?: string
  city?: string
  country?: string
  postalCode?: string
  timeZone?: string

  headline?: string
  currentJobTitle?: string
  currentCompany?: string

  linkedInUrl?: string
  gitHubUrl?: string
  portfolioUrl?: string
  stackOverflowUrl?: string
  behanceUrl?: string
  mediumUrl?: string
  twitterUrl?: string

  preferredJobTitles?: string
  preferredLocations?: string
  expectedSalary?: number
  currency?: string
  employmentTypePreference?: string
  workMode?: string
  noticePeriod?: string
  willingToRelocate?: boolean
  openToOpportunities?: boolean

  allowRecruiterSearch?: boolean
  showEmail?: boolean
  showPhone?: boolean
  showResume?: boolean
  receiveEmails?: boolean
  receiveSms?: boolean
  talentPoolConsent?: boolean
  allowAiAnalysis?: boolean

  experiences?: CandidateExperience[]
  educations?: CandidateEducation[]
  projects?: CandidateProject[]
  certifications?: CandidateCertification[]
  languages?: CandidateLanguage[]
  achievements?: CandidateAchievement[]
  documents?: CandidateDocument[]

  profileCompletionPercentage?: number
  missingSectionSuggestions?: string[]
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
  jobTitle?: string | null
}

export interface ApplicationDetail extends ApplicationSummary {
  stageHistory: ApplicationStageHistory[]
}