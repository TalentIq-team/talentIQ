import { apiClient } from '@/lib/api'
import type {
  CandidateSummary,
  EvaluationInput,
  InterviewRecord,
  RescheduleInterviewInput,
  ScheduleInterviewInput,
} from '../types'

export async function getShortlistedApplications(): Promise<CandidateSummary[]> {
  const response = await apiClient.get<CandidateSummary[]>(
    '/api/v1/applications/search',
    {
      params: { stage: 3 },
    },
  )

  return response.data
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
