import React, { useState } from 'react'
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { toErrorMessage } from '@/lib/api'
import {
  ErrorBanner,
  Spinner,
} from '@/components/Feedback'
import Button from '@/components/ui/Button'
import ScheduleInterviewModal from '../components/ScheduleInterviewModal'
import {
  advanceApplicationStage,
  cancelInterview,
  getInterviews,
  submitEvaluation,
} from '../api/interviewApi'
import type {
  InterviewRecord,
  InterviewStatus,
} from '../types'

function formatDateTime(value: string): string {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Invalid date'
  }

  return date.toLocaleString([], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getStatusLabel(status: InterviewStatus): string {
  const labels: Record<InterviewStatus, string> = {
    1: 'Scheduled',
    2: 'Completed',
    3: 'Cancelled',
    4: 'No Show',
  }

  return labels[status]
}

export const EvaluationFormPage: React.FC = () => {
  const queryClient = useQueryClient()

  const [selectedInterviewId, setSelectedInterviewId] =
    useState<string | null>(null)

  const [rescheduleTarget, setRescheduleTarget] =
    useState<InterviewRecord | null>(null)

  const [technicalScore, setTechnicalScore] = useState(8)
  const [behavioralScore, setBehavioralScore] = useState(8)

  const [recommendation, setRecommendation] = useState(
    'The candidate demonstrated suitable technical and behavioral alignment with the role.',
  )

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null)

  const [successMessage, setSuccessMessage] =
    useState<string | null>(null)

  const interviewsQuery = useQuery({
    queryKey: ['interview', 'list'],
    queryFn: getInterviews,
  })

  const interviews = interviewsQuery.data ?? []

  const selectedInterview = interviews.find(
    (interview) => interview.id === selectedInterviewId,
  )

  const scheduledInterviews = interviews
    .filter((interview) => interview.status === 1)
    .sort(
      (first, second) =>
        new Date(first.scheduledStartTime).getTime() -
        new Date(second.scheduledStartTime).getTime(),
    )

  const completedInterviews = interviews.filter(
    (interview) => interview.status === 2,
  )

  const cancelledInterviews = interviews.filter(
    (interview) => interview.status === 3,
  )

  const noShowInterviews = interviews.filter(
    (interview) => interview.status === 4,
  )

  const interviewHistory = [
    ...completedInterviews,
    ...cancelledInterviews,
    ...noShowInterviews,
  ].sort(
    (first, second) =>
      new Date(second.scheduledStartTime).getTime() -
      new Date(first.scheduledStartTime).getTime(),
  )

  const cancelMutation = useMutation({
    mutationFn: cancelInterview,

    onSuccess: async (_result, interviewId) => {
      setSuccessMessage('Interview cancelled successfully.')
      setErrorMessage(null)

      if (selectedInterviewId === interviewId) {
        setSelectedInterviewId(null)
      }

      await queryClient.invalidateQueries({
        queryKey: ['interview', 'list'],
      })
    },

    onError: (error) => {
      setSuccessMessage(null)
      setErrorMessage(toErrorMessage(error))
    },
  })

  const evaluationMutation = useMutation({
    mutationFn: async () => {
      if (!selectedInterview) {
        throw new Error('Please select an interview.')
      }

      if (selectedInterview.status !== 1) {
        throw new Error(
          'Only scheduled interviews can be evaluated.',
        )
      }

      if (!recommendation.trim()) {
        throw new Error(
          'Please enter an evaluation recommendation.',
        )
      }

      await submitEvaluation({
        interviewId: selectedInterview.id,
        technicalScore,
        behavioralScore,
        recommendation: recommendation.trim(),
      })

      try {
        await advanceApplicationStage(
          selectedInterview.applicationId,
          5,
          `Interview evaluation completed. Recommendation: ${recommendation.trim()}`,
        )
      } catch (stageError) {
        console.error(
          'Evaluation saved, but the application stage could not be updated.',
          stageError,
        )
      }
    },

    onSuccess: async () => {
      setSuccessMessage(
        'Candidate evaluation submitted successfully.',
      )
      setErrorMessage(null)
      setSelectedInterviewId(null)
      setTechnicalScore(8)
      setBehavioralScore(8)
      setRecommendation(
        'The candidate demonstrated suitable technical and behavioral alignment with the role.',
      )

      await queryClient.invalidateQueries({
        queryKey: ['interview', 'list'],
      })
    },

    onError: (error) => {
      setSuccessMessage(null)
      setErrorMessage(toErrorMessage(error))
    },
  })

  const handleCancel = (interview: InterviewRecord) => {
    const confirmed = window.confirm(
      'Are you sure you want to cancel this interview?',
    )

    if (!confirmed) {
      return
    }

    setSuccessMessage(null)
    setErrorMessage(null)
    cancelMutation.mutate(interview.id)
  }

  const handleEvaluationSubmit = (
    event: React.FormEvent,
  ) => {
    event.preventDefault()
    setSuccessMessage(null)
    setErrorMessage(null)
    evaluationMutation.mutate()
  }

  if (interviewsQuery.isLoading) {
    return <Spinner label="Loading interview workspace..." />
  }

  if (interviewsQuery.isError) {
    return (
      <ErrorBanner
        message={toErrorMessage(interviewsQuery.error)}
      />
    )
  }

  return (
    <div className="iv-page animate-fade-in">
      <header className="iv-hero">
        <div className="iv-hero-content">
          <div>
            <div className="iv-eyebrow">
              <span className="iv-eyebrow-dot" />
              Hiring Manager Workspace
            </div>

            <h1 className="iv-title">
              Interview Management
            </h1>

            <p className="iv-subtitle">
              Manage scheduled sessions, update meeting
              information, join interviews, and submit structured
              candidate evaluations.
            </p>
          </div>

          <div className="iv-hero-icon">
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
        </div>
      </header>

      <section className="iv-stat-grid">
        <article className="iv-stat-card">
          <div className="iv-stat-top">
            <div className="iv-stat-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </svg>
            </div>
          </div>

          <div className="iv-stat-value">
            {scheduledInterviews.length}
          </div>

          <div className="iv-stat-label">
            Scheduled interviews
          </div>
        </article>

        <article className="iv-stat-card">
          <div className="iv-stat-top">
            <div className="iv-stat-icon success">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
          </div>

          <div className="iv-stat-value">
            {completedInterviews.length}
          </div>

          <div className="iv-stat-label">
            Completed evaluations
          </div>
        </article>

        <article className="iv-stat-card">
          <div className="iv-stat-top">
            <div className="iv-stat-icon accent">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M12 3l1.8 4.6L18 9l-4.2 1.4L12 15l-1.8-4.6L6 9l4.2-1.4L12 3z" />
                <path d="M4 20h16" />
              </svg>
            </div>
          </div>

          <div className="iv-stat-value">
            {cancelledInterviews.length}
          </div>

          <div className="iv-stat-label">
            Cancelled interviews
          </div>
        </article>
      </section>

      {successMessage && (
        <div className="rounded-2xl border border-ok/20 bg-ok/10 px-4 py-3 text-xs font-semibold text-head shadow-sm">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="rounded-2xl border border-alert/20 bg-alert/10 px-4 py-3 text-xs font-semibold text-alert shadow-sm">
          {errorMessage}
        </div>
      )}

      {interviews.length === 0 ? (
        <section className="iv-empty">
          <div className="iv-empty-icon">
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

          <h2 className="iv-empty-title">
            No interviews available
          </h2>

          <p className="iv-empty-description">
            Interviews scheduled from the Shortlist Review page
            will appear in this workspace.
          </p>
        </section>
      ) : (
        <div className="iv-interview-layout">
          <aside className="iv-schedule-column">
            <section className="iv-panel">
              <header className="iv-panel-header">
                <div className="iv-panel-title-wrap">
                  <div className="iv-panel-icon">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <circle cx="12" cy="12" r="9" />
                      <path d="M12 7v5l3 2" />
                    </svg>
                  </div>

                  <div>
                    <h2 className="iv-panel-title">
                      Upcoming Schedule
                    </h2>

                    <p className="iv-panel-subtitle">
                      Select an interview to manage
                    </p>
                  </div>
                </div>

                <span className="iv-count-pill">
                  {scheduledInterviews.length}
                </span>
              </header>

              <div className="iv-panel-body">
                {scheduledInterviews.length === 0 ? (
                  <div className="iv-empty min-h-40">
                    <h3 className="iv-empty-title">
                      No scheduled interviews
                    </h3>

                    <p className="iv-empty-description">
                      New scheduled sessions will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="iv-interview-list">
                    {scheduledInterviews.map((interview) => (
                      <button
                        key={interview.id}
                        type="button"
                        className="iv-interview-card"
                        data-selected={
                          selectedInterviewId === interview.id
                        }
                        onClick={() => {
                          setSelectedInterviewId(interview.id)
                          setSuccessMessage(null)
                          setErrorMessage(null)
                        }}
                      >
                        <div className="iv-interview-card-top">
                          <span className="iv-interview-reference">
                            {interview.id.slice(0, 8)}
                          </span>

                          <span
                            className="iv-status-pill"
                            data-status={interview.status}
                          >
                            {getStatusLabel(interview.status)}
                          </span>
                        </div>

                        <p className="iv-interview-time">
                          {formatDateTime(
                            interview.scheduledStartTime,
                          )}
                        </p>

                        <p className="iv-interview-application">
                          Application{' '}
                          {interview.applicationId.slice(0, 8)}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {interviewHistory.length > 0 && (
              <section className="iv-panel">
                <header className="iv-panel-header">
                  <div className="iv-panel-title-wrap">
                    <div className="iv-panel-icon accent">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        <path d="M3 12a9 9 0 109-9" />
                        <path d="M3 4v6h6M12 7v5l3 2" />
                      </svg>
                    </div>

                    <div>
                      <h2 className="iv-panel-title">
                        Interview History
                      </h2>

                      <p className="iv-panel-subtitle">
                        Recent completed and cancelled sessions
                      </p>
                    </div>
                  </div>
                </header>

                <div className="iv-panel-body">
                  <div className="iv-history-list">
                    {interviewHistory
                      .slice(0, 6)
                      .map((interview) => (
                        <article
                          key={interview.id}
                          className="iv-history-card"
                        >
                          <div>
                            <p className="iv-history-time">
                              {formatDateTime(
                                interview.scheduledStartTime,
                              )}
                            </p>

                            <p className="iv-history-app">
                              Application{' '}
                              {interview.applicationId.slice(
                                0,
                                8,
                              )}
                            </p>
                          </div>

                          <span
                            className="iv-status-pill"
                            data-status={interview.status}
                          >
                            {getStatusLabel(interview.status)}
                          </span>
                        </article>
                      ))}
                  </div>
                </div>
              </section>
            )}
          </aside>

          <main className="iv-details">
            {selectedInterview ? (
              <>
                <section className="iv-detail-card">
                  <div className="iv-detail-header">
                    <div className="iv-detail-heading">
                      <div className="iv-detail-icon">
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
                        <h2 className="iv-detail-title">
                          Selected Interview
                        </h2>

                        <p className="iv-detail-date">
                          {formatDateTime(
                            selectedInterview.scheduledStartTime,
                          )}
                        </p>
                      </div>
                    </div>

                    <span
                      className="iv-status-pill"
                      data-status={selectedInterview.status}
                    >
                      {getStatusLabel(
                        selectedInterview.status,
                      )}
                    </span>
                  </div>

                  <div className="iv-detail-grid">
                    <div className="iv-detail-field">
                      <p className="iv-detail-label">
                        Interview ID
                      </p>

                      <p className="iv-detail-value">
                        {selectedInterview.id}
                      </p>
                    </div>

                    <div className="iv-detail-field">
                      <p className="iv-detail-label">
                        Application ID
                      </p>

                      <p className="iv-detail-value">
                        {selectedInterview.applicationId}
                      </p>
                    </div>

                    <div className="iv-detail-field">
                      <p className="iv-detail-label">
                        Interviewer User ID
                      </p>

                      <p className="iv-detail-value">
                        {selectedInterview.interviewerUserId}
                      </p>
                    </div>

                    <div className="iv-detail-field">
                      <p className="iv-detail-label">
                        Scheduled Time
                      </p>

                      <p className="iv-detail-value">
                        {formatDateTime(
                          selectedInterview.scheduledStartTime,
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="iv-toolbar">
                    <a
                      href={selectedInterview.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="iv-meeting-link"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        <path d="M15 10l4.5-2.5v9L15 14" />
                        <rect
                          x="3"
                          y="6"
                          width="12"
                          height="12"
                          rx="2"
                        />
                      </svg>

                      Join Meeting
                    </a>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setRescheduleTarget(
                          selectedInterview,
                        )
                      }
                    >
                      Reschedule
                    </Button>

                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      onClick={() =>
                        handleCancel(selectedInterview)
                      }
                      isLoading={
                        cancelMutation.isPending &&
                        cancelMutation.variables ===
                          selectedInterview.id
                      }
                    >
                      Cancel Interview
                    </Button>
                  </div>
                </section>

                <section className="iv-evaluation-card">
                  <header className="iv-evaluation-header">
                    <div className="iv-evaluation-title-wrap">
                      <div className="iv-evaluation-icon">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        >
                          <path d="M9 11l3 3L22 4" />
                          <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                        </svg>
                      </div>

                      <div>
                        <h2 className="iv-evaluation-title">
                          Candidate Evaluation
                        </h2>

                        <p className="iv-evaluation-subtitle">
                          Submit structured hiring feedback
                        </p>
                      </div>
                    </div>

                    <span className="iv-ai-badge">
                      Scorecard
                    </span>
                  </header>

                  <form
                    onSubmit={handleEvaluationSubmit}
                    className="iv-evaluation-body"
                  >
                    <div className="iv-score-row">
                      <div className="iv-score-top">
                        <div>
                          <p className="iv-score-name">
                            Technical Alignment
                          </p>

                          <p className="iv-score-description">
                            Technical knowledge, architecture,
                            and problem-solving capability
                          </p>
                        </div>

                        <div className="iv-score-number">
                          {technicalScore}/10
                        </div>
                      </div>

                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={technicalScore}
                        onChange={(event) =>
                          setTechnicalScore(
                            Number(event.target.value),
                          )
                        }
                        className="iv-score-slider"
                      />
                    </div>

                    <div className="iv-score-row">
                      <div className="iv-score-top">
                        <div>
                          <p className="iv-score-name">
                            Behavioral & Culture Fit
                          </p>

                          <p className="iv-score-description">
                            Communication, collaboration, and
                            alignment with company values
                          </p>
                        </div>

                        <div className="iv-score-number">
                          {behavioralScore}/10
                        </div>
                      </div>

                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={behavioralScore}
                        onChange={(event) =>
                          setBehavioralScore(
                            Number(event.target.value),
                          )
                        }
                        className="iv-score-slider"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="recommendation"
                        className="iv-recommendation-label"
                      >
                        Overall Recommendation
                      </label>

                      <textarea
                        id="recommendation"
                        required
                        value={recommendation}
                        onChange={(event) =>
                          setRecommendation(
                            event.target.value,
                          )
                        }
                        placeholder="Add detailed candidate feedback and your hiring recommendation..."
                        className="iv-recommendation"
                      />
                    </div>

                    <div className="iv-evaluation-actions">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setSelectedInterviewId(null)
                        }
                      >
                        Clear Selection
                      </Button>

                      <Button
                        type="submit"
                        variant="primary"
                        className="iv-primary-action"
                        size="sm"
                        isLoading={
                          evaluationMutation.isPending
                        }
                      >
                        Submit Evaluation
                      </Button>
                    </div>
                  </form>
                </section>
              </>
            ) : (
              <section className="iv-empty">
                <div className="iv-empty-icon">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path d="M9 11l3 3L22 4" />
                    <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                  </svg>
                </div>

                <h2 className="iv-empty-title">
                  Select an interview
                </h2>

                <p className="iv-empty-description">
                  Select a scheduled session to join the meeting,
                  reschedule, cancel, or submit the candidate
                  evaluation.
                </p>
              </section>
            )}
          </main>
        </div>
      )}

      {rescheduleTarget && (
        <ScheduleInterviewModal
          isOpen
          mode="reschedule"
          existingInterview={rescheduleTarget}
          onClose={() => setRescheduleTarget(null)}
          onSuccess={async () => {
            setSuccessMessage(
              'Interview rescheduled successfully.',
            )
            setErrorMessage(null)

            await queryClient.invalidateQueries({
              queryKey: ['interview', 'list'],
            })
          }}
        />
      )}
    </div>
  )
}

export default EvaluationFormPage
