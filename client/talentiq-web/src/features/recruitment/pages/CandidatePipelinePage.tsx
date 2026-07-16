import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { advanceApplicationStage, getJobPipeline } from '@/api/endpoints'
import { ApplicationStage, ApplicationStageLabels, type ApplicationDetail } from '@/api/types'
import { toErrorMessage } from '@/lib/api'
import { Spinner, ErrorBanner, EmptyState } from '@/components/Feedback'
import StageBadge from '@/components/ui/StageBadge'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'

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
          <p className="text-sm text-muted">Advance candidates through the recruitment stages.</p>
        </div>
        <Link to="/recruiter/jobs">
          <Button variant="secondary" size="sm">
            ← Back to jobs
          </Button>
        </Link>
      </header>

      {error && <ErrorBanner message={error} />}
      {pipelineQuery.isLoading && <Spinner label="Loading pipeline…" />}
      {pipelineQuery.isError && <ErrorBanner message={toErrorMessage(pipelineQuery.error)} />}
      {pipelineQuery.data?.length === 0 && <EmptyState message="No applications for this job yet." />}

      <div className="space-y-4">
        {pipelineQuery.data?.map((app: ApplicationDetail) => {
          const nextStages = ALLOWED_TRANSITIONS[app.stage]
          const selectOptions = [
            { value: '', label: 'Move to…' },
            ...nextStages.map((s) => ({ value: s, label: ApplicationStageLabels[s] })),
          ]
          
          return (
            <Card key={app.id} variant="glass" className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Candidate profile ID</p>
                  <p className="font-mono text-sm text-head font-medium">{app.candidateProfileId}</p>
                  <p className="mt-1.5 text-xs text-muted">
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
                </div>
                <div className="flex items-center gap-3">
                  <StageBadge stage={app.stage} />
                  {nextStages.length > 0 ? (
                    <Select
                      options={selectOptions}
                      value=""
                      disabled={advanceMutation.isPending}
                      onChange={(e) => {
                        if (e.target.value) {
                          advanceMutation.mutate({ id: app.id, target: Number(e.target.value) as ApplicationStage })
                          e.target.value = ''
                        }
                      }}
                      className="py-1.5 px-3 h-[38px] min-w-[140px]"
                    />
                  ) : (
                    <span className="text-xs text-muted border border-line px-2.5 py-1.5 rounded-xl bg-panel">
                      Final stage
                    </span>
                  )}
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
