import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { toErrorMessage } from '@/lib/api'
import { getShortlistedCandidates } from '../api/interviewApi'
import { ScheduleInterviewModal } from '../components/ScheduleInterviewModal'
import { InterviewStatusLabels, type InterviewCandidate, type InterviewStatus } from '@/types/interview'

const STATUS_FILTERS = [
  { value: 'All', label: 'All statuses' },
  { value: 'Pending', label: InterviewStatusLabels.Pending },
  { value: 'Scheduled', label: InterviewStatusLabels.Scheduled },
  { value: 'Completed', label: InterviewStatusLabels.Completed },
  { value: 'Cancelled', label: InterviewStatusLabels.Cancelled },
]

const STATUS_STYLES: Record<InterviewStatus, string> = {
  Pending: 'bg-panel-2 text-muted border-line',
  Scheduled: 'bg-m2/10 text-m2 border-m2/30',
  Completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  Cancelled: 'bg-alert/10 text-alert border-alert/30',
}

function StatusPill({ status }: { status: InterviewStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-xl border px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[status]}`}
    >
      {InterviewStatusLabels[status]}
    </span>
  )
}

/** Hiring-manager view of shortlisted candidates: review, schedule, and evaluate. */
export default function ShortlistReviewPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [scheduling, setScheduling] = useState<InterviewCandidate | null>(null)

  const query = useQuery({
    queryKey: ['interview', 'shortlist'],
    queryFn: () => getShortlistedCandidates(),
  })

  const candidates = query.data ?? []

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return candidates.filter((c) => {
      const matchesSearch =
        !term ||
        c.candidateName.toLowerCase().includes(term) ||
        (c.jobTitle?.toLowerCase().includes(term) ?? false) ||
        c.candidateProfileId.toLowerCase().includes(term)
      const matchesStatus = statusFilter === 'All' || c.interviewStatus === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [candidates, search, statusFilter])

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-head">Shortlist Review</h1>
        <p className="text-sm text-muted">
          Review shortlisted candidates, schedule interviews, and open evaluations.
        </p>
      </header>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <Input
            label="Search"
            placeholder="Search by name, role, or profile ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-56">
          <Select
            label="Interview status"
            options={STATUS_FILTERS}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
        </div>
      </div>

      {query.isLoading && <LoadingSpinner label="Loading shortlisted candidates…" />}

      {query.isError && (
        <ErrorState
          title="Unable to load candidates"
          message={toErrorMessage(query.error)}
          onRetry={() => query.refetch()}
        />
      )}

      {!query.isLoading && !query.isError && filtered.length === 0 && (
        <EmptyState
          title="No shortlisted candidates found"
          message={
            candidates.length === 0
              ? 'No shortlisted candidates found.'
              : 'No candidates match your search or filter.'
          }
        />
      )}

      {!query.isLoading && !query.isError && filtered.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c) => (
            <Card key={c.applicationId} variant="glass" hoverEffect className="flex flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-head">{c.candidateName}</h3>
                  {c.jobTitle && <p className="text-xs text-muted">{c.jobTitle}</p>}
                </div>
                <StatusPill status={c.interviewStatus} />
              </div>

              <dl className="mt-4 space-y-1.5 text-xs text-muted">
                <div className="flex justify-between gap-2">
                  <dt>Profile ID</dt>
                  <dd className="font-mono text-head/80">{c.candidateProfileId}</dd>
                </div>
                {c.yearsOfExperience != null && (
                  <div className="flex justify-between gap-2">
                    <dt>Experience</dt>
                    <dd className="text-head/80">{c.yearsOfExperience} yrs</dd>
                  </div>
                )}
                {c.aiMatchScore != null && (
                  <div className="flex justify-between gap-2">
                    <dt>AI match</dt>
                    <dd className="font-semibold text-m2">{c.aiMatchScore}%</dd>
                  </div>
                )}
              </dl>

              <div className="mt-5 flex gap-2 pt-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                  onClick={() => setScheduling(c)}
                >
                  Schedule
                </Button>
                <Button
                  size="sm"
                  className="flex-1"
                  disabled={!c.interviewId}
                  onClick={() => c.interviewId && navigate(`/interview/evaluation/${c.interviewId}`)}
                >
                  Evaluate
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {scheduling && (
        <ScheduleInterviewModal
          candidateId={scheduling.candidateProfileId}
          candidateName={scheduling.candidateName}
          applicationId={scheduling.applicationId}
          candidateEmail={scheduling.candidateEmail}
          onClose={() => setScheduling(null)}
          onSuccess={() => {
            setScheduling(null)
            query.refetch()
          }}
        />
      )}
    </div>
  )
}
