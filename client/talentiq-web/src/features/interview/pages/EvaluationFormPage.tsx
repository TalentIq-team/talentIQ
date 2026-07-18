import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { toErrorMessage } from '@/lib/api'
import { getInterviewDetails, submitEvaluation, updateEvaluation } from '../api/interviewApi'
import type { InterviewEvaluation } from '@/types/interview'

const RECOMMENDATION_OPTIONS = [
  { value: '', label: 'Select a recommendation…' },
  { value: 'StrongHire', label: 'Strong hire' },
  { value: 'Hire', label: 'Hire' },
  { value: 'NoHire', label: 'No hire' },
  { value: 'StrongNoHire', label: 'Strong no hire' },
]

const SCORE_FIELDS: { key: keyof ScoreState; label: string }[] = [
  { key: 'technicalScore', label: 'Technical skills' },
  { key: 'communicationScore', label: 'Communication' },
  { key: 'problemSolvingScore', label: 'Problem solving' },
  { key: 'cultureFitScore', label: 'Culture fit' },
]

interface ScoreState {
  technicalScore: number
  communicationScore: number
  problemSolvingScore: number
  cultureFitScore: number
}

function ScoreSlider({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted">{label}</label>
        <span className="text-sm font-bold text-m2">{value}/10</span>
      </div>
      <input
        type="range"
        min={0}
        max={10}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-panel-2 accent-m2"
      />
    </div>
  )
}

/** Interviewer scorecard for a candidate. `id` route param is the interview id. */
export default function EvaluationFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [scores, setScores] = useState<ScoreState>({
    technicalScore: 5,
    communicationScore: 5,
    problemSolvingScore: 5,
    cultureFitScore: 5,
  })
  const [recommendation, setRecommendation] = useState('')
  const [comments, setComments] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)

  // Loads the interview being evaluated (also acts as the "edit" signal).
  const interviewQuery = useQuery({
    queryKey: ['interview', 'details', id],
    queryFn: () => getInterviewDetails(id!),
    enabled: !!id,
  })

  const buildEvaluation = (): InterviewEvaluation => ({
    interviewId: id!,
    ...scores,
    recommendation,
    comments,
  })

  const submitMutation = useMutation({
    mutationFn: (payload: InterviewEvaluation) => submitEvaluation(payload),
    onSuccess: () => navigate('/interview/shortlist'),
  })

  const updateMutation = useMutation({
    mutationFn: (payload: InterviewEvaluation) => updateEvaluation(payload),
    onSuccess: () => navigate('/interview/shortlist'),
  })

  function handleSave(mode: 'submit' | 'update') {
    if (!recommendation) {
      setValidationError('An overall recommendation is required.')
      return
    }
    setValidationError(null)
    const payload = buildEvaluation()
    if (mode === 'submit') submitMutation.mutate(payload)
    else updateMutation.mutate(payload)
  }

  // Empty state: reached without a target interview.
  if (!id) {
    return (
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-bold text-head">Evaluation Scorecard</h1>
          <p className="text-sm text-muted">Score a candidate and submit a hiring recommendation.</p>
        </header>
        <EmptyState
          title="No interview selected"
          message="Select a candidate from Shortlist Review to begin an evaluation."
          actionLabel="Go to Shortlist Review"
          onAction={() => navigate('/interview/shortlist')}
        />
      </div>
    )
  }

  if (interviewQuery.isLoading) {
    return <LoadingSpinner label="Loading interview…" />
  }

  if (interviewQuery.isError) {
    return (
      <ErrorState
        title="Unable to load interview"
        message={toErrorMessage(interviewQuery.error)}
        onRetry={() => interviewQuery.refetch()}
      />
    )
  }

  const isEditing = !!interviewQuery.data
  const saving = submitMutation.isPending || updateMutation.isPending
  const mutationError = submitMutation.error ?? updateMutation.error

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-head">Evaluation Scorecard</h1>
          <p className="text-sm text-muted">
            Interview <span className="font-mono text-xs">{id}</span>
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => navigate('/interview/shortlist')}>
          ← Back to shortlist
        </Button>
      </header>

      <Card variant="glass" className="p-6">
        <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
          {SCORE_FIELDS.map((field) => (
            <ScoreSlider
              key={field.key}
              label={field.label}
              value={scores[field.key]}
              onChange={(v) => setScores((prev) => ({ ...prev, [field.key]: v }))}
            />
          ))}
        </div>

        <div className="mt-6 space-y-4">
          <Select
            label="Overall recommendation"
            options={RECOMMENDATION_OPTIONS}
            value={recommendation}
            onChange={(e) => setRecommendation(e.target.value)}
            error={validationError ?? undefined}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted">
              Interview comments
            </label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={4}
              placeholder="Summarise strengths, concerns, and rationale…"
              className="w-full rounded-xl border border-line bg-panel-2 px-4 py-2.5 text-sm text-head placeholder-muted transition-all duration-200 focus:border-m2 focus:outline-none focus:ring-1 focus:ring-m2/30"
            />
          </div>
        </div>

        {mutationError && (
          <p className="mt-4 rounded-xl border border-alert/30 bg-alert/10 px-4 py-2.5 text-sm text-alert">
            {toErrorMessage(mutationError)}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          {isEditing && (
            <Button variant="secondary" isLoading={updateMutation.isPending} onClick={() => handleSave('update')}>
              Update evaluation
            </Button>
          )}
          <Button isLoading={submitMutation.isPending} disabled={saving} onClick={() => handleSave('submit')}>
            Submit evaluation
          </Button>
        </div>
      </Card>
    </div>
  )
}
