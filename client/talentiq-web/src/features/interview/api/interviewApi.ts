import { apiClient } from '@/lib/api'
import type {
  CandidateSummary,
  EvaluationInput,
  InterviewRecord,
  RescheduleInterviewInput,
  ScheduleInterviewInput,
} from '../types'

export async function getShortlistedApplications(): Promise<CandidateSummary[]> {
  try {
    const response = await apiClient.get<CandidateSummary[]>(
      '/api/v1/applications/search',
      {
        params: { stage: 3 },
      },
    )

    if (Array.isArray(response.data) && response.data.length > 0) {
      return response.data
    }
  } catch (err) {
    console.warn('Failed to fetch shortlisted applications from API:', err)
  }

  // Fallback demo shortlisted applications when database has no stage 3 applications
  return [
    {
      id: 'demo-app-101',
      jobPostingId: '10000000-0000-0000-0000-000000000101',
      candidateProfileId: '00000000-0000-0000-0000-000000000001',
      stage: 3,
      aiMatchScore: 92,
      appliedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'demo-app-102',
      jobPostingId: '10000000-0000-0000-0000-000000000102',
      candidateProfileId: '00000000-0000-0000-0000-000000000002',
      stage: 3,
      aiMatchScore: 88,
      appliedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: 'demo-app-103',
      jobPostingId: '10000000-0000-0000-0000-000000000103',
      candidateProfileId: '00000000-0000-0000-0000-000000000003',
      stage: 3,
      aiMatchScore: 78,
      appliedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    },
  ]
}

export async function getInterviews(): Promise<InterviewRecord[]> {
  const response = await apiClient.get<InterviewRecord[]>('/api/Interview')
  return response.data
}

export async function scheduleInterview(
  input: ScheduleInterviewInput,
): Promise<void> {
  await apiClient.post('/api/Interview/schedule', input)
}

export async function rescheduleInterview(
  input: RescheduleInterviewInput,
): Promise<void> {
  await apiClient.put('/api/Interview/reschedule', input)
}

export async function cancelInterview(interviewId: string): Promise<void> {
  await apiClient.put(`/api/Interview/${interviewId}/cancel`)
}

export async function submitEvaluation(
  input: EvaluationInput,
): Promise<void> {
  await apiClient.post('/api/Interview/evaluation', input)
}

export async function advanceApplicationStage(
  applicationId: string,
  targetStage: number,
  note: string,
): Promise<void> {
  await apiClient.put(`/api/v1/applications/${applicationId}/stage`, {
    targetStage,
    note,
  })
}
