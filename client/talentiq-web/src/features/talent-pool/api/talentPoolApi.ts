import { apiClient } from '@/lib/api'

export const ConsentStatus = {
  Pending: 0,
  Accepted: 1,
  Declined: 2,
  Withdrawn: 3,
  Expired: 4,
} as const

export type ConsentStatus =
  (typeof ConsentStatus)[keyof typeof ConsentStatus]

export interface TalentPoolEntry {
  id: string
  candidateProfileId: string
  addedByRecruiterId: string
  consentStatus: ConsentStatus
  skillTags: string
  profileSnapshotJson: string
  createdAt: string
  consentRespondedAt: string | null
  consentExpiryDate: string | null
  isActive: boolean
}

export interface CandidateProgressReport {
  profileStrength: string
  skillsGainedJson: string
  resumeFreshnessStatus: string
  recommendation: string
}

export interface MonthlyAnalysisResult {
  message: string
  reportsGenerated: number
}

export interface ReEngageResult {
  message: string
  talentPoolEntryId: string
  jobId: string
}

export async function getTalentPoolEntries(): Promise<TalentPoolEntry[]> {
  const { data } = await apiClient.get<TalentPoolEntry[]>(
    '/api/v1/talent-pool/dashboard',
  )

  return data
}

export async function respondToTalentPoolConsent(
  talentPoolEntryId: string,
  accept: boolean,
  profileSnapshotJson: string,
): Promise<{ message: string }> {
  const { data } = await apiClient.post<{ message: string }>(
    '/api/v1/talent-pool/respond-consent',
    {
      talentPoolEntryId,
      accept,
      profileSnapshotJson,
    },
  )

  return data
}

export async function withdrawTalentPoolConsent(
  talentPoolEntryId: string,
): Promise<string> {
  const { data } = await apiClient.post<string>(
    '/api/v1/talent-pool/withdraw-consent',
    {
      talentPoolEntryId,
    },
  )

  return data
}

export async function getCandidateProgressReport(
  talentPoolEntryId: string,
): Promise<CandidateProgressReport> {
  const { data } = await apiClient.get<CandidateProgressReport>(
    `/api/v1/talent-pool/candidate-report/${talentPoolEntryId}`,
  )

  return data
}

export async function runMonthlyTalentPoolAnalysis(): Promise<MonthlyAnalysisResult> {
  const { data } = await apiClient.post<MonthlyAnalysisResult>(
    '/api/v1/talent-pool/run-monthly-analysis',
  )

  return data
}

export async function reEngageCandidate(
  talentPoolEntryId: string,
  jobId: string,
): Promise<ReEngageResult> {
  const { data } = await apiClient.post<ReEngageResult>(
    '/api/v1/talent-pool/reengage',
    {
      talentPoolEntryId,
      jobId,
    },
  )

  return data
}

export interface TalentPoolDashboardRow extends TalentPoolEntry {
  report: CandidateProgressReport | null
  skillsGained: string[]
  improvementScore: number
}

function parseSkillsGained(value: string): string[] {
  try {
    const parsed: unknown = JSON.parse(value)

    return Array.isArray(parsed)
      ? parsed.filter((skill): skill is string => typeof skill === 'string')
      : []
  } catch {
    return []
  }
}

export async function getTalentPoolDashboardData(): Promise<
  TalentPoolDashboardRow[]
> {
  const entries = await getTalentPoolEntries()

  const activeEntries = entries.filter(
    (entry) =>
      entry.isActive &&
      entry.consentStatus === ConsentStatus.Accepted,
  )

  const rows = await Promise.all(
    activeEntries.map(async (entry) => {
      const report = await getCandidateProgressReport(entry.id).catch(
        () => null,
      )

      const skillsGained = report
        ? parseSkillsGained(report.skillsGainedJson)
        : []

      const improvementScore =
        (report?.profileStrength === 'Trending Up' ? 100 : 0) +
        skillsGained.length

      return {
        ...entry,
        report,
        skillsGained,
        improvementScore,
      }
    }),
  )

  return rows.sort(
    (first, second) =>
      second.improvementScore - first.improvementScore ||
      new Date(second.createdAt).getTime() -
        new Date(first.createdAt).getTime(),
  )
}
