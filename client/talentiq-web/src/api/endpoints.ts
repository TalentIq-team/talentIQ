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
  const { data } = await apiClient.post<JobComparisonResult>('/api/ai/compare-job', input)
  return data
}

