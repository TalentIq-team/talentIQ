import { useQuery } from '@tanstack/react-query'
import { getCandidateApplications } from '@/api/endpoints'
import {
  ApplicationStageLabels,
  type ApplicationDetail,
} from '@/api/types'
import { toErrorMessage } from '@/lib/api'
import { getCandidateProfileId } from '@/api/session'
import {
  EmptyState,
  Spinner,
  ErrorBanner,
} from '@/components/Feedback'
import StageBadge from '@/components/ui/StageBadge'
import Card from '@/components/ui/Card'


export default function ApplicationTrackerPage() {
  const profileId = getCandidateProfileId()

  const query = useQuery({
    queryKey: ['candidate-applications', profileId],
    queryFn: () => getCandidateApplications(profileId!),
    enabled: Boolean(profileId),
  })

  if (!profileId) {
    return (
      <EmptyState message="Create your candidate profile first to track applications." />
    )
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-[var(--heading)]">
          My Applications
        </h1>

        <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
          Track the current stage and history of each application.
        </p>
      </header>

      {query.isLoading && (
        <Spinner label="Loading applications…" />
      )}

      {query.isError && (
        <ErrorBanner message={toErrorMessage(query.error)} />
      )}

      {query.data?.length === 0 && (
        <EmptyState message="You haven't applied to any jobs yet." />
      )}

      <div className="space-y-4">
        {query.data?.map((app: ApplicationDetail) => (
          <Card
            key={app.id}
            variant="glass"
            className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-e1)]"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-base font-bold text-[var(--heading)]">
                  {app.jobTitle || 'Untitled Job Posting'}
                </p>

                <p className="mt-1 font-mono text-[10px] text-[var(--muted)]">
                  Ref: {app.id}
                </p>
              </div>

              <StageBadge stage={app.stage} />
            </div>

            <p className="mt-3 text-xs text-[var(--muted)]">
              Applied {new Date(app.appliedAt).toLocaleDateString()}

              {app.aiMatchScore != null && (
                <>
                  {' '}
                  ·{' '}
                  <span className="font-semibold text-[var(--ai-accent)]">
                    AI match {app.aiMatchScore}%
                  </span>
                </>
              )}
            </p>

            {app.stageHistory.length > 0 && (
              <div className="mt-5 border-t border-[var(--border)] pt-4">
                <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
                  Stage Timeline History
                </h4>

                <ol className="ml-1 space-y-3 border-l-2 border-[var(--border)] pl-4">
                  {app.stageHistory.map((historyItem, index) => (
                    <li
                      key={index}
                      className="relative text-xs leading-5 text-[var(--text)]"
                    >
                      <span
                        className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-[var(--surface)] bg-[var(--border-strong)]"
                        aria-hidden="true"
                      />

                      <span className="text-[var(--muted)]">
                        {new Date(historyItem.changedAt).toLocaleString()} —{' '}
                      </span>

                      <span className="font-semibold text-[var(--heading)]">
                        {ApplicationStageLabels[historyItem.fromStage]}
                      </span>

                      {' → '}

                      <span className="font-semibold text-[var(--heading)]">
                        {ApplicationStageLabels[historyItem.toStage]}
                      </span>

                      {historyItem.note && (
                        <p className="mt-1.5 w-fit rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1.5 text-xs italic text-[var(--muted)]">
                          Note: {historyItem.note}
                        </p>
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}