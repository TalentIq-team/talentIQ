import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  advanceApplicationStage,
  getJobPipeline,
} from '@/api/endpoints'
import {
  ApplicationStage,
  ApplicationStageLabels,
  type ApplicationDetail,
} from '@/api/types'
import { toErrorMessage } from '@/lib/api'
import {
  Spinner,
  ErrorBanner,
  EmptyState,
} from '@/components/Feedback'
import StageBadge from '@/components/ui/StageBadge'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'

import logo from '@/assets/logo.jpeg'

<div className="flex items-center gap-3 px-5 py-4">
  <img
    src={logo}
    alt="TalentIQ"
    className="h-10 w-10 rounded-xl object-cover"
  />

  <span className="text-xl font-bold text-white">
    TalentIQ
  </span>
</div>

const ALLOWED_TRANSITIONS: Record<ApplicationStage, ApplicationStage[]> = {
  [ApplicationStage.Applied]: [
    ApplicationStage.Screening,
    ApplicationStage.Rejected,
  ],
  [ApplicationStage.Screening]: [
    ApplicationStage.Shortlisted,
    ApplicationStage.Rejected,
  ],
  [ApplicationStage.Shortlisted]: [
    ApplicationStage.InterviewScheduled,
    ApplicationStage.Rejected,
  ],
  [ApplicationStage.InterviewScheduled]: [
    ApplicationStage.Interviewed,
    ApplicationStage.Rejected,
  ],
  [ApplicationStage.Interviewed]: [
    ApplicationStage.Offered,
    ApplicationStage.Rejected,
  ],
  [ApplicationStage.Offered]: [
    ApplicationStage.Hired,
    ApplicationStage.Rejected,
  ],
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
    enabled: Boolean(jobId),
  })

  const advanceMutation = useMutation({
    mutationFn: ({
      id,
      target,
    }: {
      id: string
      target: ApplicationStage
    }) => advanceApplicationStage(id, target),

    onSuccess: () => {
      setError(null)

      queryClient.invalidateQueries({
        queryKey: ['pipeline', jobId],
      })
    },

    onError: (err) => {
      setError(toErrorMessage(err))
    },
  })

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-[var(--heading)]">
            Candidate Pipeline
          </h1>

          <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
            Advance candidates through the recruitment stages.
          </p>
        </div>

        <Link to="/recruiter/jobs">
          <Button
            variant="secondary"
            size="sm"
            className="min-h-11 rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] font-semibold text-[var(--text)] hover:bg-[var(--surface-2)] focus:ring-[var(--ring)]"
          >
            ← Back to jobs
          </Button>
        </Link>
      </header>

      {error && <ErrorBanner message={error} />}

      {pipelineQuery.isLoading && (
        <Spinner label="Loading pipeline…" />
      )}

      {pipelineQuery.isError && (
        <ErrorBanner
          message={toErrorMessage(pipelineQuery.error)}
        />
      )}

      {pipelineQuery.data?.length === 0 && (
        <EmptyState message="No applications for this job yet." />
      )}

      <div className="space-y-4">
        {pipelineQuery.data?.map((app: ApplicationDetail) => {
          const nextStages = ALLOWED_TRANSITIONS[app.stage]

          const selectOptions = [
            {
              value: '',
              label: 'Move to…',
            },
            ...nextStages.map((stage) => ({
              value: stage,
              label: ApplicationStageLabels[stage],
            })),
          ]

          return (
            <Card
              key={app.id}
              variant="glass"
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-e1)]"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                    Candidate Profile ID
                  </p>

                  <p className="mt-1 font-mono text-sm font-medium text-[var(--text)]">
                    {app.candidateProfileId}
                  </p>

                  <p className="mt-1.5 text-xs text-[var(--muted)]">
                    Applied{' '}
                    {new Date(app.appliedAt).toLocaleDateString()}

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
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <StageBadge stage={app.stage} />

                  {nextStages.length > 0 ? (
                    <Select
                      options={selectOptions}
                      value=""
                      disabled={advanceMutation.isPending}
                      className="min-h-11 min-w-[160px] rounded-lg border-[var(--border-strong)] bg-[var(--surface)] text-[var(--text)]"
                      onChange={(event) => {
                        if (!event.target.value) return

                        advanceMutation.mutate({
                          id: app.id,
                          target: Number(
                            event.target.value,
                          ) as ApplicationStage,
                        })

                        event.target.value = ''
                      }}
                    />
                  ) : (
                    <span className="inline-flex min-h-11 items-center rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 text-xs font-medium text-[var(--muted)]">
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