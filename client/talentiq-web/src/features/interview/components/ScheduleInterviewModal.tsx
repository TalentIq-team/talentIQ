import React, { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { toErrorMessage } from '@/lib/api'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import {
  rescheduleInterview,
  scheduleInterview,
} from '../api/interviewApi'
import type { InterviewRecord } from '../types'

interface ScheduleInterviewModalProps {
  isOpen: boolean
  onClose: () => void
  mode?: 'schedule' | 'reschedule'
  applicationId?: string
  existingInterview?: InterviewRecord
  onSuccess?: () => void | Promise<void>
}

const guidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function toLocalDateTimeInput(value: string): string {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  const timezoneOffset = date.getTimezoneOffset() * 60_000

  return new Date(date.getTime() - timezoneOffset)
    .toISOString()
    .slice(0, 16)
}

function getMinimumDateTime(): string {
  const date = new Date()
  const timezoneOffset = date.getTimezoneOffset() * 60_000

  return new Date(date.getTime() - timezoneOffset)
    .toISOString()
    .slice(0, 16)
}

export const ScheduleInterviewModal: React.FC<
  ScheduleInterviewModalProps
> = ({
  isOpen,
  onClose,
  mode = 'schedule',
  applicationId,
  existingInterview,
  onSuccess,
}) => {
  const [candidateEmail, setCandidateEmail] = useState('')

  const [interviewerId, setInterviewerId] = useState(
    existingInterview?.interviewerUserId ?? '',
  )

  const [startTime, setStartTime] = useState(
    existingInterview
      ? toLocalDateTimeInput(
          existingInterview.scheduledStartTime,
        )
      : '',
  )

  const [meetingLink, setMeetingLink] = useState(
    existingInterview?.meetingLink ?? '',
  )

  const [error, setError] = useState<string | null>(null)

  const interviewMutation = useMutation({
    mutationFn: async () => {
      setError(null)

      if (!startTime) {
        throw new Error(
          'Please select the interview date and time.',
        )
      }

      if (new Date(startTime).getTime() <= Date.now()) {
        throw new Error(
          'Please select a future interview date and time.',
        )
      }

      if (!meetingLink.trim()) {
        throw new Error('Please enter the meeting link.')
      }

      if (mode === 'reschedule') {
        if (!existingInterview) {
          throw new Error(
            'The selected interview could not be found.',
          )
        }

        await rescheduleInterview({
          interviewId: existingInterview.id,
          newScheduledTime: new Date(
            startTime,
          ).toISOString(),
          newMeetingLink: meetingLink.trim(),
        })

        return
      }

      if (!applicationId) {
        throw new Error(
          'The selected application could not be found.',
        )
      }

      if (!candidateEmail.trim()) {
        throw new Error(
          'Please enter the candidate email address.',
        )
      }

      if (!guidPattern.test(interviewerId.trim())) {
        throw new Error(
          'Please enter a valid interviewer user ID in UUID format.',
        )
      }

      await scheduleInterview({
        applicationId,
        interviewerUserId: interviewerId.trim(),
        scheduledStartTime: new Date(startTime).toISOString(),
        meetingLink: meetingLink.trim(),
        candidateEmail: candidateEmail.trim(),
      })
    },

    onSuccess: async () => {
      await onSuccess?.()
      onClose()
    },

    onError: (mutationError) => {
      setError(toErrorMessage(mutationError))
    },
  })

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    interviewMutation.mutate()
  }

  const isRescheduling = mode === 'reschedule'

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        isRescheduling
          ? 'Reschedule Interview'
          : 'Schedule Candidate Interview'
      }
      size="md"
    >
      <form
        onSubmit={handleSubmit}
        className="iv-form-grid"
      >
        <div className="iv-modal-summary">
          <div className="iv-modal-summary-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <rect
                x="3"
                y="5"
                width="18"
                height="16"
                rx="2"
              />
              <path d="M16 3v4M8 3v4M3 11h18" />
            </svg>
          </div>

          <div>
            <p className="iv-modal-summary-title">
              {isRescheduling
                ? 'Update the interview schedule'
                : 'Create a new interview session'}
            </p>

            <p className="iv-modal-summary-text">
              {isRescheduling
                ? 'Choose a new date, time, and meeting link for this interview.'
                : 'The candidate will receive an invitation with the selected meeting information.'}
            </p>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-alert/20 bg-alert/5 p-3 text-xs font-medium text-alert">
            {error}
          </div>
        )}

        {!isRescheduling && (
          <>
            <Input
              label="Candidate Email"
              type="email"
              required
              placeholder="candidate@example.com"
              value={candidateEmail}
              onChange={(event) =>
                setCandidateEmail(event.target.value)
              }
            />

            <Input
              label="Interviewer User ID"
              type="text"
              required
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              value={interviewerId}
              onChange={(event) =>
                setInterviewerId(event.target.value)
              }
            />

            <div className="iv-form-note">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 11v5M12 8h.01" />
              </svg>

              <span>
                Use the full interviewer UUID. Student IDs or
                short numeric IDs are not accepted.
              </span>
            </div>
          </>
        )}

        {isRescheduling && existingInterview && (
          <div className="rounded-xl border border-line bg-panel-2/40 p-3">
            <p className="text-[9px] font-bold uppercase tracking-wider text-muted">
              Interview reference
            </p>

            <p className="mt-1 break-all font-mono text-[10px] text-head">
              {existingInterview.id}
            </p>
          </div>
        )}

        <div className="iv-form-divider" />

        <Input
          label={
            isRescheduling
              ? 'New Scheduled Time'
              : 'Scheduled Start Time'
          }
          type="datetime-local"
          min={getMinimumDateTime()}
          required
          value={startTime}
          onChange={(event) =>
            setStartTime(event.target.value)
          }
        />

        <Input
          label="Video Meeting Link"
          type="url"
          required
          placeholder="https://meet.google.com/..."
          value={meetingLink}
          onChange={(event) =>
            setMeetingLink(event.target.value)
          }
        />

        <div className="iv-modal-actions">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={interviewMutation.isPending}
          >
            Close
          </Button>

          <Button
            type="submit"
            variant="primary"
            className="iv-primary-action"
            size="sm"
            isLoading={interviewMutation.isPending}
          >
            {isRescheduling
              ? 'Save New Schedule'
              : 'Schedule Interview'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default ScheduleInterviewModal
