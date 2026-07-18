// M4 — Interview + Hiring Manager module types.
// Mirrors the Interview module API DTOs (ScheduleInterviewCommand,
// RescheduleInterviewCommand, SubmitEvaluationCommand).

/** UI-level status for a candidate's interview lifecycle. */
export type InterviewStatus = 'Pending' | 'Scheduled' | 'Completed' | 'Cancelled'

export const InterviewStatusLabels: Record<InterviewStatus, string> = {
  Pending: 'Not scheduled',
  Scheduled: 'Scheduled',
  Completed: 'Completed',
  Cancelled: 'Cancelled',
}

/** A shortlisted candidate surfaced to the hiring manager for review. */
export interface InterviewCandidate {
  applicationId: string
  candidateProfileId: string
  candidateName: string
  candidateEmail?: string
  jobTitle?: string
  yearsOfExperience?: number
  aiMatchScore?: number | null
  interviewStatus: InterviewStatus
  interviewId?: string | null
}

/** A scheduled interview record. */
export interface Interview {
  id: string
  applicationId: string
  interviewerUserId: string
  scheduledStartTime: string
  meetingLink: string
  candidateEmail: string
  status: InterviewStatus
}

/** POST /api/interview/schedule */
export interface ScheduleInterviewRequest {
  applicationId: string
  interviewerUserId: string
  scheduledStartTime: string // ISO 8601
  meetingLink: string
  candidateEmail: string
}

/** PUT /api/interview/reschedule */
export interface RescheduleInterviewRequest {
  interviewId: string
  newScheduledTime: string // ISO 8601
  newMeetingLink: string
}

/**
 * Rich client-side evaluation scorecard captured in the UI. The backend
 * currently persists a subset (technical + behavioural + recommendation);
 * the additional dimensions are retained client-side until the API expands.
 */
export interface InterviewEvaluation {
  interviewId: string
  technicalScore: number
  communicationScore: number
  problemSolvingScore: number
  cultureFitScore: number
  recommendation: string
  comments: string
}

/** POST /api/interview/evaluation */
export interface EvaluationRequest {
  interviewId: string
  technicalScore: number
  behavioralScore: number
  recommendation: string
}
