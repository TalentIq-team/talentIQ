import { apiClient } from '@/lib/api'

export interface AnalyticsDashboard {
  totalApplications: number
  shortlistedCount: number
  interviewsScheduled: number
  offersAccepted: number
  averageTimeToHireDays: number
  snapshotDate?: string
}

export interface HiringFunnelStage {
  stage: string
  count: number
  conversionRate: number
}

export interface DaysToFill {
  estimatedDaysToFill: number
  note: string
}

export interface RecruiterPerformance {
  jobsManaged: number
  applicationsProcessed: number
  averageScreeningTurnaroundDays: number
}

export interface AnalyticsOverview {
  dashboard: AnalyticsDashboard
  funnel: HiringFunnelStage[]
  daysToFill: DaysToFill
  recruiterPerformance: RecruiterPerformance
}

export async function getAnalyticsOverview(): Promise<AnalyticsOverview> {
  const [dashboardResponse, funnelResponse, daysToFillResponse, recruiterResponse] =
    await Promise.all([
      apiClient.get<AnalyticsDashboard>('/api/v1/analytics/dashboard'),
      apiClient.get<HiringFunnelStage[]>('/api/v1/analytics/hiring-funnel'),
      apiClient.get<DaysToFill>('/api/v1/analytics/days-to-fill'),
      apiClient.get<RecruiterPerformance>('/api/v1/analytics/recruiter-performance'),
    ])

  return {
    dashboard: dashboardResponse.data,
    funnel: funnelResponse.data,
    daysToFill: daysToFillResponse.data,
    recruiterPerformance: recruiterResponse.data,
  }
}
