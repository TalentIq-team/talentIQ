import { apiClient } from './client'
import type {
  ApplicationDetail,
  ApplicationSummary,
  CandidateProfile,
  EmploymentType,
  JobPosting,
} from './types'
import { ApplicationStage } from './types'

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

export interface JobSearchFilters {
  title?: string
  skillId?: string
  location?: string
  employmentType?: EmploymentType
}

export async function searchJobs(filters: JobSearchFilters): Promise<JobPosting[]> {
  const { data } = await apiClient.get<JobPosting[]>('/api/v1/jobs', { params: filters })
  return data
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
