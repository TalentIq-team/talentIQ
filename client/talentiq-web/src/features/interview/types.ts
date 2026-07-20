export type ApplicationStage = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8

export type InterviewStatus = 1 | 2 | 3 | 4

export interface CandidateSummary {
  id: string
  jobPostingId: string
  candidateProfileId: string
  stage: ApplicationStage
  aiMatchScore: number | null
  appliedAt: string
  updatedAt: string
}

export interface InterviewRecord {
  id: string
  applicationId: string
  scheduledStartTime: string
  interviewerUserId: string
  meetingLink: string
  status: InterviewStatus
}

export interface ScheduleInterviewInput {
  applicationId: string
  interviewerUserId: string
  scheduledStartTime: string
  meetingLink: string
  candidateEmail: string
}

export interface RescheduleInterviewInput {
  interviewId: string
  newScheduledTime: string
  newMeetingLink: string
}

export interface EvaluationInput {
  interviewId: string
  technicalScore: number
  behavioralScore: number
  recommendation: string
}
