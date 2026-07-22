import '../../analytics/m6-design.css'
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import DataTable, { type Column } from '@/components/ui/DataTable'
import { ErrorState } from '@/components/ui/ErrorState'
import { toErrorMessage } from '@/lib/api'
import {
  ConsentStatus,
  getTalentPoolDashboardData,
  reEngageCandidate,
  runMonthlyTalentPoolAnalysis,
  type TalentPoolDashboardRow,
} from '../api/talentPoolApi'

function shortenId(value: string): string {
  return `${value.slice(0, 8)}...`
}

function isValidGuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  )
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(value))
}

export default function TalentPoolDashboardPage() {
  const queryClient = useQueryClient()
  const [jobIds, setJobIds] = useState<Record<string, string>>({})
  const [message, setMessage] = useState<string | null>(null)

  const dashboardQuery = useQuery({
    queryKey: ['talent-pool', 'dashboard'],
    queryFn: getTalentPoolDashboardData,
  })

  const analysisMutation = useMutation({
    mutationFn: runMonthlyTalentPoolAnalysis,

    onSuccess: (result) => {
      setMessage(
        `${result.message} ${result.reportsGenerated} report(s) generated.`,
      )

      queryClient.invalidateQueries({
        queryKey: ['talent-pool', 'dashboard'],
      })
    },

    onError: (error) => {
      setMessage(toErrorMessage(error))
    },
  })

  const reEngageMutation = useMutation({
    mutationFn: ({
      entryId,
      jobId,
    }: {
      entryId: string
      jobId: string
    }) => reEngageCandidate(entryId, jobId),

    onSuccess: (result) => {
      setMessage(result.message)
    },

    onError: (error) => {
      setMessage(toErrorMessage(error))
    },
  })

  if (dashboardQuery.isError) {
    return (
      <ErrorState
        title="Unable to load the talent pool"
        message={toErrorMessage(dashboardQuery.error)}
        onRetry={() => dashboardQuery.refetch()}
      />
    )
  }

  const columns: Column<TalentPoolDashboardRow>[] = [
    {
      key: 'candidate',
      header: 'Candidate',
      render: (entry) => (
        <div>
          <p className="font-semibold text-head">
            Candidate {shortenId(entry.candidateProfileId)}
          </p>

          <p className="mt-1 text-xs text-muted">
            Added {formatDate(entry.createdAt)}
          </p>
        </div>
      ),
    },
    {
      key: 'consent',
      header: 'Consent',
      render: (entry) => {
        const isAccepted =
          entry.consentStatus === ConsentStatus.Accepted

        const labels = {
          [ConsentStatus.Pending]: 'Pending',
          [ConsentStatus.Accepted]: 'Accepted',
          [ConsentStatus.Declined]: 'Declined',
          [ConsentStatus.Withdrawn]: 'Withdrawn',
          [ConsentStatus.Expired]: 'Expired',
        }

        return (
          <span
            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${
              isAccepted
                ? 'border-ok/20 bg-ok/10 text-ok'
                : 'border-line bg-panel-2 text-muted'
            }`}
          >
            {labels[entry.consentStatus] ?? 'Unknown'}
          </span>
        )
      },
    },
    {
      key: 'skills',
      header: 'Skills',
      render: (entry) => {
        const skills = entry.skillTags
          .split(',')
          .map((skill) => skill.trim())
          .filter(Boolean)

        return (
          <div className="flex max-w-xs flex-wrap gap-1.5">
            {skills.length === 0 ? (
              <span className="text-xs text-muted">No skills</span>
            ) : (
              skills.slice(0, 4).map((skill) => (
                <span
                  key={skill}
                  className="rounded-md border border-line bg-panel-2 px-2 py-1 text-xs text-head"
                >
                  {skill}
                </span>
              ))
            )}
          </div>
        )
      },
    },
    {
      key: 'improvement',
      header: 'Improvement',
      render: (entry) => (
        <div>
          <span
            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${
              entry.report?.profileStrength === 'Trending Up'
                ? 'border-ok/20 bg-ok/10 text-ok'
                : 'border-line bg-panel-2 text-muted'
            }`}
          >
            {entry.report?.profileStrength ?? 'No report'}
          </span>

          <p className="mt-2 text-xs text-muted">
            {entry.skillsGained.length} new skill(s)
          </p>
        </div>
      ),
    },
    {
      key: 'recommendation',
      header: 'Recommendation',
      render: (entry) => (
        <div>
          <p className="text-sm font-medium text-head">
            {entry.report?.recommendation ?? 'Analysis pending'}
          </p>

          <p className="mt-1 text-xs text-muted">
            Resume: {entry.report?.resumeFreshnessStatus ?? 'Not analysed'}
          </p>
        </div>
      ),
    },
    {
      key: 'action',
      header: 'Re-engage',
      className: 'min-w-64',
      render: (entry) => {
        const jobId = jobIds[entry.id] ?? ''
        const validJobId = isValidGuid(jobId)

        return (
          <div className="space-y-2">
            <input
              type="text"
              value={jobId}
              placeholder="Paste Job ID"
              aria-label={`Job ID for candidate ${entry.candidateProfileId}`}
              className="w-full rounded-lg border border-line bg-panel-2 px-3 py-2 text-xs text-head placeholder:text-muted focus:border-m2 focus:outline-none"
              onChange={(event) =>
                setJobIds((current) => ({
                  ...current,
                  [entry.id]: event.target.value.trim(),
                }))
              }
            />

            <Button
              size="sm"
              variant="primary"
              disabled={!validJobId || reEngageMutation.isPending}
              isLoading={reEngageMutation.isPending}
              onClick={() =>
                reEngageMutation.mutate({
                  entryId: entry.id,
                  jobId,
                })
              }
            >
              Send Invitation
            </Button>
          </div>
        )
      },
    },
  ]

  return (
    <div className="m6-page space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-head">
            Talent Pool Dashboard
          </h1>

          <p className="mt-1 text-sm text-muted">
            Review active candidates, improvement signals and re-engagement
            readiness.
          </p>
        </div>

        <Button
          variant="secondary"
          isLoading={analysisMutation.isPending}
          onClick={() => analysisMutation.mutate()}
        >
          Run Monthly Analysis
        </Button>
      </header>

      {message && (
        <Card
          variant="borderless"
          className="border border-m2/20 bg-m2/10 px-4 py-3 text-sm font-medium text-head"
        >
          {message}
        </Card>
      )}

      <section className="grid gap-4 sm:grid-cols-3">
        <Card variant="glass" className="p-5">
          <p className="text-xs uppercase tracking-wider text-muted">
            Active candidates
          </p>

          <p className="mt-3 text-3xl font-bold text-head">
            {dashboardQuery.data?.length ?? 0}
          </p>
        </Card>

        <Card variant="glass" className="p-5">
          <p className="text-xs uppercase tracking-wider text-muted">
            Trending up
          </p>

          <p className="mt-3 text-3xl font-bold text-head">
            {dashboardQuery.data?.filter(
              (entry) =>
                entry.report?.profileStrength === 'Trending Up',
            ).length ?? 0}
          </p>
        </Card>

        <Card variant="glass" className="p-5">
          <p className="text-xs uppercase tracking-wider text-muted">
            Ready to approach
          </p>

          <p className="mt-3 text-3xl font-bold text-head">
            {dashboardQuery.data?.filter(
              (entry) =>
                entry.report?.recommendation === 'Ready-to-Approach',
            ).length ?? 0}
          </p>
        </Card>
      </section>

      <div className="m6-table-shell">
        <DataTable
          columns={columns}
          data={dashboardQuery.data ?? []}
          isLoading={dashboardQuery.isLoading}
          emptyMessage="No candidates have active accepted talent pool consent."
          pageSize={8}
        />
      </div>

      <p className="text-xs leading-relaxed text-muted">
        Candidate ordering uses available improvement signals such as profile
        strength and newly gained skills. It is a statistical ranking, not a
        machine-learning prediction.
      </p>
    </div>
  )
}
