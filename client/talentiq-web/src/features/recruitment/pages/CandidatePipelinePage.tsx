import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
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
  EmptyState,
  ErrorBanner,
  Spinner,
} from '@/components/Feedback'
import StageBadge from '@/components/ui/StageBadge'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'

const PIPELINE_STAGES: ApplicationStage[] = [
  ApplicationStage.Applied,
  ApplicationStage.Screening,
  ApplicationStage.Shortlisted,
  ApplicationStage.InterviewScheduled,
  ApplicationStage.Interviewed,
  ApplicationStage.Offered,
  ApplicationStage.Hired,
  ApplicationStage.Rejected,
]

const ALLOWED_TRANSITIONS: Record<
  ApplicationStage,
  ApplicationStage[]
> = {
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

    onError: (mutationError) => {
      setError(toErrorMessage(mutationError))
    },
  })

  const applications = pipelineQuery.data ?? []

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-semibold tracking-tight text-[var(--heading)]">
              Candidate Pipeline
            </h1>
            {jobId && (
              <span className="inline-flex items-center rounded-md border border-white/10 bg-[#001845] px-2.5 py-1 text-xs font-mono font-bold text-[#38bdf8]">
                Job ID: {jobId}
              </span>
            )}
          </div>

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

      {!pipelineQuery.isLoading &&
        !pipelineQuery.isError &&
        applications.length === 0 && (
          <EmptyState message="No applications for this job yet." />
        )}

      {applications.length > 0 && (
        <div className="overflow-x-auto pb-4">
          <div className="grid min-w-[2240px] grid-cols-8 gap-4">
            {PIPELINE_STAGES.map((stage) => {
              const stageApplications = applications.filter(
                (application) => application.stage === stage,
              )

              return (
                <section
                  key={stage}
                  className="min-h-[420px] rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-3"
                >
                  <header className="mb-3 flex items-center justify-between gap-2 border-b border-[var(--border)] pb-3">
                    <h2 className="text-sm font-semibold text-[var(--heading)]">
                      {ApplicationStageLabels[stage]}
                    </h2>

                    <span className="inline-flex min-w-7 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-xs font-semibold text-[var(--muted)]">
                      {stageApplications.length}
                    </span>
                  </header>

                  <div className="space-y-3">
                    {stageApplications.length === 0 && (
                      <div className="rounded-xl border border-dashed border-[var(--border-strong)] bg-[var(--surface)] p-4 text-center text-xs text-[var(--muted)]">
                        No candidates
                      </div>
                    )}

                    {stageApplications.map(
                      (application: ApplicationDetail) => {
                        const nextStages =
                          ALLOWED_TRANSITIONS[application.stage]

                        const selectOptions = [
                          {
                            value: '',
                            label: 'Move to…',
                          },
                          ...nextStages.map((nextStage) => ({
                            value: nextStage,
                            label:
                              ApplicationStageLabels[nextStage],
                          })),
                        ]

                        return (
                          <Card
                            key={application.id}
                            variant="glass"
                            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-e1)]"
                          >
                            <div className="space-y-3">
                              <div>
                                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                                  Candidate Profile ID
                                </p>

                                <p className="mt-1 break-all font-mono text-xs font-medium text-[var(--text)]">
                                  {application.candidateProfileId}
                                </p>

                                <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
                                  Applied{' '}
                                  {new Date(
                                    application.appliedAt,
                                  ).toLocaleDateString()}

                                  {application.aiMatchScore != null && (
                                    <>
                                      {' '}
                                      ·{' '}
                                      <span className="font-semibold text-[var(--ai-accent)]">
                                        AI match{' '}
                                        {application.aiMatchScore}%
                                      </span>
                                    </>
                                  )}
                                </p>
                              </div>

                              <StageBadge
                                stage={application.stage}
                              />

                              {nextStages.length > 0 ? (
                                <Select
                                  options={selectOptions}
                                  value=""
                                  disabled={
                                    advanceMutation.isPending
                                  }
                                  className="min-h-10 w-full rounded-lg border-[var(--border-strong)] bg-[var(--surface)] text-[var(--text)]"
                                  onChange={(event) => {
                                    if (!event.target.value) return

                                    advanceMutation.mutate({
                                      id: application.id,
                                      target: Number(
                                        event.target.value,
                                      ) as ApplicationStage,
                                    })

                                    event.target.value = ''
                                  }}
                                />
                              ) : (
                                <span className="inline-flex min-h-10 w-full items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 text-xs font-medium text-[var(--muted)]">
                                  Final stage
                                </span>
                              )}
                            </div>
                          </Card>
                        )
                      },
                    )}
                  </div>
                </section>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
