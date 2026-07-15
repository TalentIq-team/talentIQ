import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { advanceApplicationStage, getJobPipeline } from '../../api/endpoints'
import { ApplicationStage, ApplicationStageLabels, type ApplicationDetail } from '../../api/types'
import { toErrorMessage } from '../../api/client'
import { EmptyState, ErrorBanner, Spinner } from '../../components/Feedback'
import { StageBadge } from '../../components/StageBadge'

// Mirrors the domain State pattern: allowed next stages per current stage.
const ALLOWED_TRANSITIONS: Record<ApplicationStage, ApplicationStage[]> = {
  [ApplicationStage.Applied]: [ApplicationStage.Screening, ApplicationStage.Rejected],
  [ApplicationStage.Screening]: [ApplicationStage.Shortlisted, ApplicationStage.Rejected],
  [ApplicationStage.Shortlisted]: [ApplicationStage.InterviewScheduled, ApplicationStage.Rejected],
  [ApplicationStage.InterviewScheduled]: [ApplicationStage.Interviewed, ApplicationStage.Rejected],
  [ApplicationStage.Interviewed]: [ApplicationStage.Offered, ApplicationStage.Rejected],
  [ApplicationStage.Offered]: [ApplicationStage.Hired, ApplicationStage.Rejected],
  [ApplicationStage.Hired]: [],
  [ApplicationStage.Rejected]: [],
}

export default function CandidatePipelinePage() {
  const { jobId } = useParams<{ jobId: string }>()
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)

  const pipelineQuery = useQuery({
    queryKey: ['pipeline', jobId],
    queryFn: () => getJobPipeline(jobId!),
    enabled: !!jobId,
  })

  const advanceMutation = useMutation({
    mutationFn: ({ id, target }: { id: string; target: ApplicationStage }) =>
      advanceApplicationStage(id, target),
    onSuccess: () => {
      setError(null)
      queryClient.invalidateQueries({ queryKey: ['pipeline', jobId] })
    },
    onError: (e) => setError(toErrorMessage(e)),
  })

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Candidate Pipeline</h1>
          <p className="text-sm text-slate-500">Advance candidates through the recruitment stages.</p>
        </div>
        <Link to="/recruiter/jobs" className="text-sm font-medium text-indigo-600 hover:underline">
          ← Back to jobs
        </Link>
      </header>

      {error && <ErrorBanner message={error} />}
      {pipelineQuery.isLoading && <Spinner label="Loading pipeline…" />}
      {pipelineQuery.isError && <ErrorBanner message={toErrorMessage(pipelineQuery.error)} />}
      {pipelineQuery.data?.length === 0 && <EmptyState message="No applications for this job yet." />}

      <div className="space-y-3">
        {pipelineQuery.data?.map((app: ApplicationDetail) => {
          const nextStages = ALLOWED_TRANSITIONS[app.stage]
          return (
            <div key={app.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-mono text-sm">{app.candidateProfileId}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Applied {new Date(app.appliedAt).toLocaleDateString()}
                    {app.aiMatchScore != null && <> · AI match {app.aiMatchScore}%</>}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StageBadge stage={app.stage} />
                  {nextStages.length > 0 ? (
                    <select
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
                      defaultValue=""
                      disabled={advanceMutation.isPending}
                      onChange={(e) => {
                        if (e.target.value) {
                          advanceMutation.mutate({ id: app.id, target: Number(e.target.value) as ApplicationStage })
                          e.target.value = ''
                        }
                      }}
                    >
                      <option value="">Move to…</option>
                      {nextStages.map((s) => (
                        <option key={s} value={s}>
                          {ApplicationStageLabels[s]}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-xs text-slate-400">Final stage</span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
