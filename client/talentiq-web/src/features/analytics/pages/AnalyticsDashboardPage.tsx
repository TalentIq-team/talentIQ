import { useQuery } from '@tanstack/react-query'
import Card from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ErrorState } from '@/components/ui/ErrorState'
import { EmptyState } from '@/components/ui/EmptyState'
import { toErrorMessage } from '@/lib/api'
import {
  getAnalyticsOverview,
  type HiringFunnelStage,
} from '../api/analyticsApi'

interface KpiCardProps {
  label: string
  value: string | number
  description: string
}

function KpiCard({ label, value, description }: KpiCardProps) {
  return (
    <Card variant="glass" hoverEffect className="p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted">
        {label}
      </p>

      <p className="mt-3 text-3xl font-bold text-head">{value}</p>

      <p className="mt-2 text-xs leading-relaxed text-muted">
        {description}
      </p>
    </Card>
  )
}

function FunnelRow({ stage }: { stage: HiringFunnelStage }) {
  const percentage = Math.min(100, Math.max(0, stage.conversionRate))

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-head">{stage.stage}</p>
          <p className="text-xs text-muted">{stage.count} candidates</p>
        </div>

        <span className="text-sm font-bold text-head">
          {stage.conversionRate}%
        </span>
      </div>

      <div
        className="h-3 overflow-hidden rounded-full bg-panel-2"
        role="progressbar"
        aria-label={`${stage.stage} conversion rate`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percentage}
      >
        <div
          className="h-full rounded-full bg-m2 transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

export default function AnalyticsDashboardPage() {
  const analyticsQuery = useQuery({
    queryKey: ['analytics', 'overview'],
    queryFn: getAnalyticsOverview,
  })

  if (analyticsQuery.isLoading) {
    return (
      <Card variant="glass" className="p-8">
        <LoadingSpinner label="Loading analytics dashboard..." />
      </Card>
    )
  }

  if (analyticsQuery.isError) {
    return (
      <ErrorState
        title="Unable to load analytics"
        message={toErrorMessage(analyticsQuery.error)}
        onRetry={() => analyticsQuery.refetch()}
      />
    )
  }

  if (!analyticsQuery.data) {
    return (
      <EmptyState
        title="No analytics available"
        message="Analytics data has not been generated yet."
      />
    )
  }

  const {
    dashboard,
    funnel,
    daysToFill,
    recruiterPerformance,
  } = analyticsQuery.data

  const kpis: KpiCardProps[] = [
    {
      label: 'Total Applications',
      value: dashboard.totalApplications,
      description: 'Applications received across all active job postings.',
    },
    {
      label: 'Shortlisted',
      value: dashboard.shortlistedCount,
      description: 'Candidates currently selected for further review.',
    },
    {
      label: 'Interviews Scheduled',
      value: dashboard.interviewsScheduled,
      description: 'Interviews scheduled by the recruitment team.',
    },
    {
      label: 'Offers Accepted',
      value: dashboard.offersAccepted,
      description: 'Candidates who accepted employment offers.',
    },
  ]

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-head">
            Recruitment Analytics
          </h1>

          <p className="mt-1 text-sm text-muted">
            Monitor recruitment KPIs, hiring funnel performance and estimated
            time-to-fill.
          </p>
        </div>

        <div className="rounded-xl border border-line bg-panel px-4 py-2">
          <p className="text-xs uppercase tracking-wider text-muted">
            Average time to hire
          </p>

          <p className="mt-1 text-xl font-bold text-head">
            {dashboard.averageTimeToHireDays} days
          </p>
        </div>
      </header>

      <section
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Recruitment key performance indicators"
      >
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <Card variant="glass" className="p-6 xl:col-span-2">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-head">Hiring Funnel</h2>

            <p className="mt-1 text-sm text-muted">
              Candidate movement through each recruitment stage.
            </p>
          </div>

          {funnel.length === 0 ? (
            <EmptyState
              title="No funnel data"
              message="Candidate funnel information is not available yet."
            />
          ) : (
            <div className="space-y-6">
              {funnel.map((stage) => (
                <FunnelRow key={stage.stage} stage={stage} />
              ))}
            </div>
          )}
        </Card>

        <div className="space-y-6">
          <Card variant="glass" className="p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">
              Estimated days to fill
            </p>

            <div className="mt-4 flex items-end gap-2">
              <p className="text-5xl font-bold text-head">
                {daysToFill.estimatedDaysToFill}
              </p>

              <p className="pb-1 text-sm text-muted">days</p>
            </div>

            <p className="mt-4 rounded-xl border border-line bg-panel-2 p-3 text-xs leading-relaxed text-muted">
              {daysToFill.note}
            </p>
          </Card>

          <Card variant="glass" className="p-6">
            <h2 className="text-lg font-bold text-head">
              Recruiter Performance
            </h2>

            <div className="mt-5 space-y-4">
              <div className="flex justify-between gap-4 border-b border-line pb-3">
                <span className="text-sm text-muted">Jobs managed</span>
                <span className="font-bold text-head">
                  {recruiterPerformance.jobsManaged}
                </span>
              </div>

              <div className="flex justify-between gap-4 border-b border-line pb-3">
                <span className="text-sm text-muted">
                  Applications processed
                </span>
                <span className="font-bold text-head">
                  {recruiterPerformance.applicationsProcessed}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-sm text-muted">
                  Screening turnaround
                </span>
                <span className="font-bold text-head">
                  {recruiterPerformance.averageScreeningTurnaroundDays} days
                </span>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  )
}
