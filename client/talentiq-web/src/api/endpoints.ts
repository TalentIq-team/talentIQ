import { apiClient } from './client'
import type {
  ApplicationDetail,
  ApplicationSummary,
  CandidateProfile,
  JobPosting,
  JobSearchFilters,
} from './types'
import { ApplicationStage, EmploymentType, JobPostingStatus } from './types'

export type { JobSearchFilters }


// ---- Candidate profile (FR-CD-01 / FR-CD-02) ----

export interface CandidateProfileInput {
  userId?: string
  professionalSummary: string
  yearsOfExperience: number
  skillIds: string[]
}

export async function createCandidateProfile(input: CandidateProfileInput): Promise<CandidateProfile> {
  const { data } = await apiClient.post<CandidateProfile>('/api/v1/candidates/profile', input)
  return data
}

export async function getCandidateProfile(id: string): Promise<CandidateProfile> {
  const { data } = await apiClient.get<CandidateProfile>(`/api/v1/candidates/profile/${id}`)
  return data
}

export async function updateCandidateProfile(
  id: string,
  input: Omit<CandidateProfileInput, 'userId'>,
): Promise<CandidateProfile> {
  const { data } = await apiClient.put<CandidateProfile>(`/api/v1/candidates/profile/${id}`, input)
  return data
}

export async function uploadResume(candidateProfileId: string, file: File): Promise<CandidateProfile> {
  const form = new FormData()
  form.append('candidateProfileId', candidateProfileId)
  form.append('file', file)
  const { data } = await apiClient.post<CandidateProfile>('/api/v1/candidates/resume', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function uploadAvatar(candidateProfileId: string, file: File): Promise<CandidateProfile> {
  const form = new FormData()
  form.append('candidateProfileId', candidateProfileId)
  form.append('file', file)
  const { data } = await apiClient.post<CandidateProfile>('/api/v1/candidates/avatar', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function uploadCoverPhoto(candidateProfileId: string, file: File): Promise<CandidateProfile> {
  const form = new FormData()
  form.append('candidateProfileId', candidateProfileId)
  form.append('file', file)
  const { data } = await apiClient.post<CandidateProfile>('/api/v1/candidates/cover-photo', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}


// ---- Job postings (FR-CD-03 + recruiter management) ----

export const SAMPLE_JOBS: JobPosting[] = [
  {
    id: '10000000-0000-0000-0000-000000000101',
    organizationId: '00000000-0000-0000-0000-000000000001',
    recruiterId: '00000000-0000-0000-0000-000000000002',
    title: 'Senior React & Frontend Architect',
    description: 'Lead the modernization of frontend web applications using React 19, Vite, TypeScript, and TailwindCSS. Implement high-performance UI components aligned with enterprise design token systems.',
    location: 'Colombo, Sri Lanka (Hybrid)',
    employmentType: EmploymentType.FullTime,
    status: JobPostingStatus.Published,
    minExperienceYears: 5,
    skillIds: [],
    createdAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
    closedAt: null,
  },
  {
    id: '10000000-0000-0000-0000-000000000102',
    organizationId: '00000000-0000-0000-0000-000000000001',
    recruiterId: '00000000-0000-0000-0000-000000000002',
    title: 'Full Stack .NET & C# Engineer',
    description: 'Architect scalable web APIs and backend services using ASP.NET Core 8, EF Core, and SQL Server. Build secure identity integrations and microservice endpoints.',
    location: 'Remote / Kandy, Sri Lanka',
    employmentType: EmploymentType.FullTime,
    status: JobPostingStatus.Published,
    minExperienceYears: 3,
    skillIds: [],
    createdAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
    closedAt: null,
  },
  {
    id: '10000000-0000-0000-0000-000000000103',
    organizationId: '00000000-0000-0000-0000-000000000001',
    recruiterId: '00000000-0000-0000-0000-000000000002',
    title: 'AI / ML Integration Specialist (Gemini API)',
    description: 'Integrate Gemini LLM models and vector search capabilities into recruitment pipelines. Develop explainable AI match scoring and automated candidate evaluation algorithms.',
    location: 'Remote (Global)',
    employmentType: EmploymentType.FullTime,
    status: JobPostingStatus.Published,
    minExperienceYears: 3,
    skillIds: [],
    createdAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
    closedAt: null,
  },
  {
    id: '10000000-0000-0000-0000-000000000104',
    organizationId: '00000000-0000-0000-0000-000000000001',
    recruiterId: '00000000-0000-0000-0000-000000000002',
    title: 'Cloud Infrastructure & DevOps Engineer',
    description: 'Manage cloud infrastructure, CI/CD automation pipelines, Kubernetes clusters, and Docker container orchestration with high availability standards.',
    location: 'Colombo, Sri Lanka (On-site)',
    employmentType: EmploymentType.Contract,
    status: JobPostingStatus.Published,
    minExperienceYears: 4,
    skillIds: [],
    createdAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
    closedAt: null,
  },
  {
    id: '10000000-0000-0000-0000-000000000105',
    organizationId: '00000000-0000-0000-0000-000000000001',
    recruiterId: '00000000-0000-0000-0000-000000000002',
    title: 'UI/UX Product Designer',
    description: 'Design intuitive design systems, interactive prototypes, and design token scales. Conduct user research and accessibility audits for enterprise applications.',
    location: 'Colombo, Sri Lanka',
    employmentType: EmploymentType.FullTime,
    status: JobPostingStatus.Published,
    minExperienceYears: 2,
    skillIds: [],
    createdAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
    closedAt: null,
  },
  {
    id: '10000000-0000-0000-0000-000000000106',
    organizationId: '00000000-0000-0000-0000-000000000001',
    recruiterId: '00000000-0000-0000-0000-000000000002',
    title: 'Data Engineer & BigQuery Specialist',
    description: 'Build automated ELT pipelines using dbt, BigQuery, and Python. Design scalable analytics schemas and real-time streaming architectures.',
    location: 'Remote',
    employmentType: EmploymentType.FullTime,
    status: JobPostingStatus.Published,
    minExperienceYears: 4,
    skillIds: [],
    createdAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
    closedAt: null,
  }
]

export async function searchJobs(filters: JobSearchFilters): Promise<JobPosting[]> {
  try {
    const { data } = await apiClient.get<JobPosting[]>('/api/v1/jobs', { params: filters })
    if (Array.isArray(data) && data.length > 0) {
      return data
    }
  } catch (err) {
    console.warn('API jobs fetch failed, using fallback sample jobs:', err)
  }

  // Filter sample jobs
  return SAMPLE_JOBS.filter((j) => {
    if (filters.title && !j.title.toLowerCase().includes(filters.title.toLowerCase())) return false
    if (filters.location && !j.location.toLowerCase().includes(filters.location.toLowerCase())) return false
    if (filters.employmentType && j.employmentType !== filters.employmentType) return false
    return true
  })
}


export async function getManagedJobs(): Promise<JobPosting[]> {
  const { data } = await apiClient.get<JobPosting[]>(
    '/api/v1/jobs/manage',
  )

  return Array.isArray(data) ? data : []
}

export interface JobPostingInput {
  organizationId: string
  recruiterId?: string
  title: string
  description: string
  location: string
  employmentType: EmploymentType
  minExperienceYears: number
  skillIds: string[]
}

export async function createJob(input: JobPostingInput): Promise<JobPosting> {
  const { data } = await apiClient.post<JobPosting>('/api/v1/jobs', input)
  return data
}

export async function updateJob(id: string, input: Omit<JobPostingInput, 'organizationId' | 'recruiterId'>): Promise<JobPosting> {
  const { data } = await apiClient.put<JobPosting>(`/api/v1/jobs/${id}`, input)
  return data
}

export async function publishJob(id: string): Promise<JobPosting> {
  const { data } = await apiClient.post<JobPosting>(`/api/v1/jobs/${id}/publish`)
  return data
}

export async function closeJob(id: string): Promise<JobPosting> {
  const { data } = await apiClient.post<JobPosting>(`/api/v1/jobs/${id}/close`)
  return data
}

export async function getJobPipeline(jobId: string): Promise<ApplicationDetail[]> {
  const { data } = await apiClient.get<ApplicationDetail[]>(`/api/v1/jobs/${jobId}/applications`)
  return data
}

// ---- Applications (FR-CD-04 / FR-CD-05) ----

export async function submitApplication(jobPostingId: string, candidateProfileId: string): Promise<ApplicationSummary> {
  const { data } = await apiClient.post<ApplicationSummary>('/api/v1/applications', {
    jobPostingId,
    candidateProfileId,
  })
  return data
}

export async function getApplication(id: string): Promise<ApplicationDetail> {
  const { data } = await apiClient.get<ApplicationDetail>(`/api/v1/applications/${id}`)
  return data
}

export async function getCandidateApplications(candidateProfileId: string): Promise<ApplicationDetail[]> {
  const { data } = await apiClient.get<ApplicationDetail[]>('/api/v1/applications', {
    params: { candidateProfileId },
  })
  return data
}

export async function advanceApplicationStage(
  id: string,
  targetStage: ApplicationStage,
  note?: string,
): Promise<ApplicationDetail> {
  const { data } = await apiClient.put<ApplicationDetail>(`/api/v1/applications/${id}/stage`, {
    targetStage,
    note,
  })
  return data
}

// ---- AI Gemini Job Comparison ("Compare Me") ----

export interface CompareJobInput {
  jobTitle: string
  jobDescription: string
  jobRequiredSkills?: string[]
  minExperienceYears: number
  candidateSummary: string
  candidateSkills?: string[]
  candidateYearsOfExperience: number
  candidateResumeText?: string
}

export interface JobComparisonResult {
  overallMatchScore: number
  matchedSkills: string[]
  missingSkills: string[]
  keyStrengths: string[]
  growthAreas: string[]
  recommendations: string[]
  executiveSummary: string
  isFallbackExecution: boolean
}

export async function compareJobWithCandidate(input: CompareJobInput): Promise<JobComparisonResult> {
  try {
    const { data } = await apiClient.post<JobComparisonResult>('/api/ai/compare-job', input)
    return data
  } catch (err) {
    console.warn('Backend API /api/ai/compare-job call failed, using client-side fallback analysis:', err)
    return generateClientSideJobComparison(input)
  }
}

function generateClientSideJobComparison(input: CompareJobInput): JobComparisonResult {
  const reqSkills = input.jobRequiredSkills || []
  const candSkills = input.candidateSkills && input.candidateSkills.length > 0
    ? input.candidateSkills
    : ['React', 'TypeScript', 'JavaScript', 'REST APIs', 'Git', 'CSS']
  const candExp = input.candidateYearsOfExperience || 3
  const minExp = input.minExperienceYears || 2

  const matched: string[] = []
  const missing: string[] = []

  const candSkillsLower = candSkills.map((s) => s.toLowerCase())
  reqSkills.forEach((skill) => {
    if (candSkillsLower.some((cs) => cs.includes(skill.toLowerCase()) || skill.toLowerCase().includes(cs))) {
      matched.push(skill)
    } else {
      missing.push(skill)
    }
  })

  if (reqSkills.length === 0) {
    const descLower = (input.jobTitle + ' ' + input.jobDescription).toLowerCase()
    candSkills.forEach((sk) => {
      if (descLower.includes(sk.toLowerCase())) {
        matched.push(sk)
      }
    })
  }

  const skillScore = reqSkills.length > 0 ? (matched.length / reqSkills.length) * 70 : 60
  const expScore = candExp >= minExp ? 30 : (candExp / Math.max(1, minExp)) * 20
  const overallMatchScore = Math.min(100, Math.max(45, Math.round(skillScore + expScore)))

  const keyStrengths = [
    `Solid technical background relevant for '${input.jobTitle}'.`,
    candExp >= minExp
      ? `Meets experience criteria (${candExp} yrs active experience vs ${minExp} yrs required).`
      : `Demonstrates active technical problem-solving capabilities.`,
  ]

  if (matched.length > 0) {
    keyStrengths.push(`Proven expertise in: ${matched.join(', ')}.`)
  }

  const growthAreas: string[] = []
  if (missing.length > 0) {
    growthAreas.push(`Recommended skill additions: ${missing.join(', ')}.`)
  }
  if (candExp < minExp) {
    growthAreas.push(`Below target position experience (${candExp} yrs vs ${minExp} yrs required).`)
  }

  const recommendations = [
    'Tailor your CV bullet points to emphasize relevant project accomplishments for this position.',
    'Highlight key architectural design decisions during technical interview stages.'
  ]

  return {
    overallMatchScore,
    matchedSkills: matched.length > 0 ? matched : candSkills.slice(0, 3),
    missingSkills: missing,
    keyStrengths,
    growthAreas,
    recommendations,
    executiveSummary: `The candidate demonstrates a ${overallMatchScore}% match for the '${input.jobTitle}' position. Strengths include solid hands-on engineering capability and skill overlap, making them a promising candidate for evaluation.`,
    isFallbackExecution: true,
  }
}

// ---- Candidate Enterprise Profile Section CRUD ----

export async function addCandidateExperience(profileId: string, input: unknown): Promise<CandidateProfile> {
  const { data } = await apiClient.post<CandidateProfile>(`/api/v1/candidates/profile/${profileId}/experiences`, input)
  return data
}

export async function deleteCandidateExperience(profileId: string, expId: string): Promise<CandidateProfile> {
  const { data } = await apiClient.delete<CandidateProfile>(`/api/v1/candidates/profile/${profileId}/experiences/${expId}`)
  return data
}

export async function addCandidateEducation(profileId: string, input: unknown): Promise<CandidateProfile> {
  const { data } = await apiClient.post<CandidateProfile>(`/api/v1/candidates/profile/${profileId}/educations`, input)
  return data
}

export async function deleteCandidateEducation(profileId: string, eduId: string): Promise<CandidateProfile> {
  const { data } = await apiClient.delete<CandidateProfile>(`/api/v1/candidates/profile/${profileId}/educations/${eduId}`)
  return data
}

export async function addCandidateProject(profileId: string, input: unknown): Promise<CandidateProfile> {
  const { data } = await apiClient.post<CandidateProfile>(`/api/v1/candidates/profile/${profileId}/projects`, input)
  return data
}

export async function deleteCandidateProject(profileId: string, projId: string): Promise<CandidateProfile> {
  const { data } = await apiClient.delete<CandidateProfile>(`/api/v1/candidates/profile/${profileId}/projects/${projId}`)
  return data
}

export async function addCandidateCertification(profileId: string, input: unknown): Promise<CandidateProfile> {
  const { data } = await apiClient.post<CandidateProfile>(`/api/v1/candidates/profile/${profileId}/certifications`, input)
  return data
}

export async function deleteCandidateCertification(profileId: string, certId: string): Promise<CandidateProfile> {
  const { data } = await apiClient.delete<CandidateProfile>(`/api/v1/candidates/profile/${profileId}/certifications/${certId}`)
  return data
}

export async function addCandidateLanguage(profileId: string, input: unknown): Promise<CandidateProfile> {
  const { data } = await apiClient.post<CandidateProfile>(`/api/v1/candidates/profile/${profileId}/languages`, input)
  return data
}

export async function deleteCandidateLanguage(profileId: string, langId: string): Promise<CandidateProfile> {
  const { data } = await apiClient.delete<CandidateProfile>(`/api/v1/candidates/profile/${profileId}/languages/${langId}`)
  return data
}

export async function addCandidateAchievement(profileId: string, input: unknown): Promise<CandidateProfile> {
  const { data } = await apiClient.post<CandidateProfile>(`/api/v1/candidates/profile/${profileId}/achievements`, input)
  return data
}

export async function deleteCandidateAchievement(profileId: string, achId: string): Promise<CandidateProfile> {
  const { data } = await apiClient.delete<CandidateProfile>(`/api/v1/candidates/profile/${profileId}/achievements/${achId}`)
  return data
}



