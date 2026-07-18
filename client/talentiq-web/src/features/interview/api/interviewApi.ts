// M4 — Interview + Hiring Manager API layer.
// Uses the shared axios instance from @/lib/api (no raw fetch, no new instance).

import { apiClient } from '@/lib/api'
import type {
  EvaluationRequest,
  Interview,
  InterviewCandidate,
  InterviewEvaluation,
  RescheduleInterviewRequest,
  ScheduleInterviewRequest,
} from '@/types/interview'

// Backend route: InterviewController → [Route("api/[controller]")] → /api/interview
const BASE = '/api/interview'

/**
 * Fetch shortlisted candidates awaiting interview / evaluation.
 *
 * TODO(backend): no dedicated shortlist endpoint exists on InterviewController yet.
 * Confirm the final route via Swagger. This is wired against the expected shape so
 * the UI is ready for integration the moment the endpoint lands.
 */
export async function getShortlistedCandidates(jobId?: string): Promise<InterviewCandidate[]> {
  const { data } = await apiClient.get<InterviewCandidate[]>(`${BASE}/shortlist`, {
    params: jobId ? { jobId } : undefined,
  })
  return data
}

/**
 * Fetch a single interview's details (used to pre-fill the evaluation scorecard).
 *
 * TODO(backend): no GET-by-id endpoint exists on InterviewController yet.
 * Confirm the route via Swagger.
 */
export async function getInterviewDetails(interviewId: string): Promise<Interview> {
  const { data } = await apiClient.get<Interview>(`${BASE}/${interviewId}`)
  return data
}

/** Schedule a new interview. POST /api/interview/schedule */
export async function scheduleInterview(payload: ScheduleInterviewRequest): Promise<void> {
  await apiClient.post(`${BASE}/schedule`, payload)
}

/** Reschedule an existing interview. PUT /api/interview/reschedule */
export async function updateInterview(payload: RescheduleInterviewRequest): Promise<void> {
  await apiClient.put(`${BASE}/reschedule`, payload)
}

/**
 * Cancel an interview.
 *
 * TODO(backend): no cancel/delete endpoint exists on InterviewController yet.
 * Confirm the route via Swagger.
 */
export async function cancelInterview(interviewId: string): Promise<void> {
  await apiClient.delete(`${BASE}/${interviewId}`)
}

/**
 * Submit an interview evaluation. POST /api/interview/evaluation
 *
 * The API persists technicalScore, behavioralScore and recommendation. The richer
 * scorecard (communication / problem-solving / culture-fit / comments) is mapped
 * down to that contract here until the backend contract expands.
 */
export async function submitEvaluation(
  evaluation: InterviewEvaluation,
): Promise<void> {
  const payload: EvaluationRequest = toEvaluationRequest(evaluation)
  await apiClient.post(`${BASE}/evaluation`, payload)
}

/**
 * Update an existing evaluation.
 *
 * TODO(backend): no dedicated update endpoint exists yet — reuses the evaluation
 * endpoint which currently upserts. Confirm semantics via Swagger.
 */
export async function updateEvaluation(
  evaluation: InterviewEvaluation,
): Promise<void> {
  const payload: EvaluationRequest = toEvaluationRequest(evaluation)
  await apiClient.post(`${BASE}/evaluation`, payload)
}

/** Collapse the rich client scorecard onto the backend's evaluation contract. */
function toEvaluationRequest(evaluation: InterviewEvaluation): EvaluationRequest {
  const behavioral =
    (evaluation.communicationScore +
      evaluation.problemSolvingScore +
      evaluation.cultureFitScore) /
    3
  return {
    interviewId: evaluation.interviewId,
    technicalScore: evaluation.technicalScore,
    behavioralScore: Number(behavioral.toFixed(2)),
    recommendation: evaluation.recommendation,
  }
}
