import { useQuery } from '@tanstack/react-query'
import { getCandidateApplications } from '@/api/endpoints'
import { ApplicationStageLabels, type ApplicationDetail } from '@/api/types'
import { toErrorMessage } from '@/lib/api'
import { getCandidateProfileId } from '@/api/session'
import { EmptyState, Spinner, ErrorBanner } from '@/components/Feedback'
import StageBadge from '@/components/ui/StageBadge'
import Card from '@/components/ui/Card'

export default function ApplicationTrackerPage() {
  const profileId = getCandidateProfileId()

  const query = useQuery({
    queryKey: ['candidate-applications', profileId],
    queryFn: () => getCandidateApplications(profileId!),
    enabled: !!profileId,
  })

  if (!profileId) {
    return <EmptyState message="Create your candidate profile first to track applications." />
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">My Applications</h1>
        <p className="text-sm text-muted">Track the current stage and history of each application.</p>
      </header>

      {query.isLoading && <Spinner label="Loading applications…" />}
      {query.isError && <ErrorBanner message={toErrorMessage(query.error)} />}
      {query.data?.length === 0 && <EmptyState message="You haven't applied to any jobs yet." />}

      <div className="space-y-4">
        {query.data?.map((app: ApplicationDetail) => (
          <Card key={app.id} variant="glass" className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Application Ref</p>
                <p className="font-mono text-sm text-head font-medium">{app.id}</p>
              </div>
              <StageBadge stage={app.stage} />
            </div>

            <p className="mt-3 text-xs text-muted">
              Applied {new Date(app.appliedAt).toLocaleDateString()}
              {app.aiMatchScore != null && (
                <>
                  {' '}
                  ·{' '}
                  <span className="font-semibold text-m2">
                    AI match {app.aiMatchScore}%
                  </span>
                </>
              )}
            </p>

            {app.stageHistory.length > 0 && (
              <div className="mt-5 border-t border-line/50 pt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted mb-3">
                  Stage Timeline History
                </h4>
                <ol className="space-y-3 border-l-2 border-line/60 pl-4 ml-1">
                  {app.stageHistory.map((h, i) => (
                    <li key={i} className="text-xs text-text relative">
                      <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-line" />
                      <span className="text-muted">{new Date(h.changedAt).toLocaleString()} — </span>
                      <span className="font-semibold text-head">
                        {ApplicationStageLabels[h.fromStage]}
                      </span>{' '}
                      →{' '}
                      <span className="font-semibold text-head">
                        {ApplicationStageLabels[h.toStage]}
                      </span>
                      {h.note && (
                        <p className="text-muted mt-1 italic bg-panel-2/30 px-3 py-1.5 rounded-lg border border-line/30 w-fit">
                          Note: {h.note}
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
