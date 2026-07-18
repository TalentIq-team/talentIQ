import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { toErrorMessage } from '@/lib/api'
import { scheduleInterview } from '../api/interviewApi'
import type { ScheduleInterviewRequest } from '@/types/interview'

export interface ScheduleInterviewModalProps {
  /** Candidate identifier. Used as the applicationId unless `applicationId` is provided. */
  candidateId: string
  candidateName: string
  /** Optional explicit application id (falls back to candidateId). */
  applicationId?: string
  /** Optional candidate email to notify. */
  candidateEmail?: string
  onSuccess: () => void
  onClose: () => void
}

const INTERVIEW_TYPE_OPTIONS = [
  { value: 'Technical', label: 'Technical' },
  { value: 'Behavioural', label: 'Behavioural / HR' },
  { value: 'Managerial', label: 'Managerial' },
  { value: 'Final', label: 'Final round' },
]

interface FormErrors {
  date?: string
  time?: string
  interviewer?: string
  email?: string
}

/**
 * Self-contained modal for scheduling a candidate interview. Designed to be
 * mounted from anywhere (e.g. the recruitment pipeline) without depending on
 * feature-specific state.
 */
export function ScheduleInterviewModal({
  candidateId,
  candidateName,
  applicationId,
  candidateEmail,
  onSuccess,
  onClose,
}: ScheduleInterviewModalProps) {
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [interviewType, setInterviewType] = useState(INTERVIEW_TYPE_OPTIONS[0].value)
  const [interviewerUserId, setInterviewerUserId] = useState('')
  const [meetingLink, setMeetingLink] = useState('')
  const [email, setEmail] = useState(candidateEmail ?? '')
  const [notes, setNotes] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})

  const mutation = useMutation({
    mutationFn: (payload: ScheduleInterviewRequest) => scheduleInterview(payload),
    onSuccess,
  })

  function validate(): FormErrors {
    const next: FormErrors = {}
    if (!date) next.date = 'Interview date is required.'
    if (!time) next.time = 'Interview time is required.'
    if (!interviewerUserId.trim()) next.interviewer = 'An interviewer must be selected.'
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      next.email = 'Enter a valid email address.'
    }
    return next
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const validation = validate()
    setErrors(validation)
    if (Object.keys(validation).length > 0) return

    const scheduledStartTime = new Date(`${date}T${time}`).toISOString()
    mutation.mutate({
      applicationId: applicationId ?? candidateId,
      interviewerUserId: interviewerUserId.trim(),
      scheduledStartTime,
      meetingLink: meetingLink.trim(),
      candidateEmail: email.trim(),
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-line bg-panel shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-line px-6 py-5">
          <div>
            <h2 className="text-lg font-bold text-head">Schedule Interview</h2>
            <p className="mt-0.5 text-sm text-muted">
              {candidateName}{' '}
              <span className="font-mono text-xs text-muted/80">· {candidateId}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1 text-muted transition-colors hover:bg-panel-2 hover:text-head"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Interview date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              error={errors.date}
            />
            <Input
              label="Interview time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              error={errors.time}
            />
          </div>

          <Select
            label="Interview type"
            options={INTERVIEW_TYPE_OPTIONS}
            value={interviewType}
            onChange={(e) => setInterviewType(e.target.value)}
          />

          {/* TODO(backend): replace with a Select populated from an interviewers/users endpoint. */}
          <Input
            label="Interviewer (user ID)"
            placeholder="Interviewer user id"
            value={interviewerUserId}
            onChange={(e) => setInterviewerUserId(e.target.value)}
            error={errors.interviewer}
          />

          <Input
            label="Candidate email"
            type="email"
            placeholder="candidate@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
          />

          <Input
            label="Meeting link"
            placeholder="https://meet.example.com/…"
            value={meetingLink}
            onChange={(e) => setMeetingLink(e.target.value)}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted">
              Notes / comments
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Add context for the interviewer…"
              className="w-full rounded-xl border border-line bg-panel-2 px-4 py-2.5 text-sm text-head placeholder-muted transition-all duration-200 focus:border-m2 focus:outline-none focus:ring-1 focus:ring-m2/30"
            />
          </div>

          {mutation.isError && (
            <p className="rounded-xl border border-alert/30 bg-alert/10 px-4 py-2.5 text-sm text-alert">
              {toErrorMessage(mutation.error)}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose} disabled={mutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" isLoading={mutation.isPending}>
              Schedule interview
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ScheduleInterviewModal
