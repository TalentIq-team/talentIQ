import { useQuery } from '@tanstack/react-query'
import { getCandidateApplications } from '../../api/endpoints'
import { ApplicationStageLabels, type ApplicationDetail } from '../../api/types'
import { toErrorMessage } from '../../api/client'
import { getCandidateProfileId } from '../../api/session'
import { EmptyState, ErrorBanner, Spinner } from '../../components/Feedback'
import { StageBadge } from '../../components/StageBadge'

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
        <p className="text-sm text-slate-500">Track the current stage and history of each application.</p>
      </header>

      {query.isLoading && <Spinner label="Loading applications…" />}
      {query.isError && <ErrorBanner message={toErrorMessage(query.error)} />}
      {query.data?.length === 0 && <EmptyState message="You haven't applied to any jobs yet." />}

      <div className="space-y-4">
        {query.data?.map((app: ApplicationDetail) => (
          <div key={app.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">Application</p>
                <p className="font-mono text-sm">{app.id}</p>
              </div>
              <StageBadge stage={app.stage} />
            </div>

            <p className="mt-2 text-xs text-slate-500">
              Applied {new Date(app.appliedAt).toLocaleDateString()}
              {app.aiMatchScore != null && <> · AI match {app.aiMatchScore}%</>}
            </p>

            {app.stageHistory.length > 0 && (
              <ol className="mt-4 space-y-2 border-l-2 border-slate-100 pl-4">
                {app.stageHistory.map((h, i) => (
                  <li key={i} className="text-sm">
                    <span className="text-slate-400">{new Date(h.changedAt).toLocaleString()} — </span>
                    {ApplicationStageLabels[h.fromStage]} → {ApplicationStageLabels[h.toStage]}
                    {h.note && <span className="text-slate-500"> ({h.note})</span>}
                  </li>
                ))}
              </ol>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
