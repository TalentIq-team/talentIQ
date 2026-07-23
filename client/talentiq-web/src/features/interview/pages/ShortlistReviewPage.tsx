import React, { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toErrorMessage, apiClient } from '@/lib/api'
import {
  ErrorBanner,
  Spinner,
} from '@/components/Feedback'
import Button from '@/components/ui/Button'
import StageBadge from '@/components/ui/StageBadge'
import AiMatchBreakdown from '@/features/ai/components/AiMatchBreakdown'
import GenerateQuestionsPanel from '@/features/ai/components/GenerateQuestionsPanel'
import ScheduleInterviewModal from '../components/ScheduleInterviewModal'
import {
  advanceApplicationStage,
  getShortlistedApplications,
} from '../api/interviewApi'

export const ShortlistReviewPage: React.FC = () => {
  const queryClient = useQueryClient()

  const [selectedAppId, setSelectedAppId] =
    useState<string | null>(null)

  const [isScheduleOpen, setIsScheduleOpen] = useState(false)

  const [successMessage, setSuccessMessage] =
    useState<string | null>(null)

  const applicationsQuery = useQuery({
    queryKey: ['interview', 'shortlisted-applications'],
    queryFn: getShortlistedApplications,
  })

  // Fetch details to get job posting title for questions panel
  const { data: appDetail } = useQuery({
    queryKey: ['application-detail', selectedAppId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/api/v1/applications/${selectedAppId}`)
      return data
    },
    enabled: !!selectedAppId,
  })

  const { data: jobDetail } = useQuery({
    queryKey: ['job-detail', appDetail?.jobPostingId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/api/v1/jobs/${appDetail.jobPostingId}`)
      return data
    },
    enabled: !!appDetail?.jobPostingId,
  })

  if (applicationsQuery.isLoading) {
    return <Spinner label="Loading shortlisted candidates..." />
  }

  if (applicationsQuery.isError) {
    return (
      <ErrorBanner
        message={toErrorMessage(applicationsQuery.error)}
      />
    )
  }

  const applications = applicationsQuery.data ?? []

  const selectedApplication = applications.find(
    (application) => application.id === selectedAppId,
  )

  const strongMatches = applications.filter(
    (application) =>
      application.aiMatchScore !== null &&
      application.aiMatchScore >= 70,
  ).length

  return (
    <div className="iv-page animate-fade-in">
      <header className="iv-hero">
        <div className="iv-hero-content">
          <div>
            <div className="iv-eyebrow">
              <span className="iv-eyebrow-dot" />
              Interview Intelligence
            </div>

            <h1 className="iv-title">Shortlist Review</h1>

            <p className="iv-subtitle">
              Review shortlisted candidates, inspect AI match
              insights, and move the strongest applicants into
              the interview stage.
            </p>
          </div>

          <div className="iv-hero-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M19 8v6M22 11h-6" />
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
                <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
                <circle cx="9" cy="7" r="4" />
              </svg>
            </div>
          </div>

          <div className="iv-stat-value">
            {applications.length}
          </div>
          <div className="iv-stat-label">
            Shortlisted candidates
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
                <path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15z" />
              </svg>
            </div>
          </div>

          <div className="iv-stat-value">{strongMatches}</div>
          <div className="iv-stat-label">
            Strong AI matches
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
            {selectedApplication ? 1 : 0}
          </div>
          <div className="iv-stat-label">
            Candidate selected
          </div>
        </article>
      </section>

      {successMessage && (
        <div className="rounded-2xl border border-ok/20 bg-ok/10 px-4 py-3 text-xs font-semibold text-head shadow-sm">
          {successMessage}
        </div>
      )}

      {applications.length === 0 ? (
        <section className="iv-empty">
          <div className="iv-empty-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M17 11h5M19.5 8.5v5" />
            </svg>
          </div>

          <h2 className="iv-empty-title">
            No shortlisted candidates yet
          </h2>

          <p className="iv-empty-description">
            Candidates moved into the Shortlisted stage will
            appear here for AI review and interview scheduling.
          </p>
        </section>
      ) : (
        <div className="iv-layout">
          <section>
            <div className="iv-section-heading">
              <h2 className="iv-section-title">
                Candidate Queue
              </h2>

              <span className="iv-count-pill">
                {applications.length}
              </span>
            </div>

            <div className="iv-candidate-list">
              {applications.map((application) => {
                const isSelected =
                  selectedAppId === application.id

                return (
                  <article
                    key={application.id}
                    className="iv-candidate-card"
                    data-selected={isSelected}
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      setSelectedAppId(application.id)
                      setSuccessMessage(null)
                    }}
                    onKeyDown={(event) => {
                      if (
                        event.key === 'Enter' ||
                        event.key === ' '
                      ) {
                        setSelectedAppId(application.id)
                        setSuccessMessage(null)
                      }
                    }}
                  >
                    <div className="iv-candidate-top">
                      <div className="iv-candidate-identity">
                        <div className="iv-candidate-avatar">
                          CP
                        </div>

                        <div className="min-w-0">
                          <p className="iv-candidate-name">
                            Candidate Profile
                          </p>

                          <p className="iv-candidate-id">
                            Profile ID: {application.candidateProfileId.slice(0, 8)}...
                          </p>
                          <p className="text-[11px] font-mono text-[#38bdf8] font-semibold mt-0.5">
                            Job ID: {application.jobPostingId}
                          </p>
                        </div>
                      </div>

                      <StageBadge
                        stage={application.stage}
                      />
                    </div>

                    <div className="iv-candidate-meta">
                      <span className="iv-score-pill">
                        {application.aiMatchScore !== null
                          ? `${application.aiMatchScore}% match`
                          : 'Match pending'}
                      </span>

                      <span className="iv-date">
                        {new Date(
                          application.appliedAt,
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  </article>
                )
              })}
            </div>
          </section>

          <section className="space-y-4">
            {selectedApplication ? (
              <>
                <div className="iv-ai-panel">
                  <div className="iv-ai-header">
                    <div className="iv-ai-title-wrap">
                      <div className="iv-ai-icon">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        >
                          <path d="M12 3l1.8 4.6L18 9l-4.2 1.4L12 15l-1.8-4.6L6 9l4.2-1.4L12 3z" />
                          <circle cx="18" cy="17" r="3" />
                        </svg>
                      </div>

                      <div>
                        <h2 className="iv-ai-title">
                          AI Match Intelligence
                        </h2>

                        <p className="iv-ai-description">
                          Candidate compatibility and skill
                          alignment analysis
                        </p>
                      </div>
                    </div>

                    <span className="iv-ai-badge">
                      AI Generated
                    </span>
                  </div>

                  <div className="relative z-[1]">
                    <AiMatchBreakdown
                      applicationId={selectedApplication.id}
                    />
                  </div>
                </div>

                <GenerateQuestionsPanel
                  applicationId={selectedApplication.id}
                  jobTitle={jobDetail?.title || 'Software Engineer'}
                  jobDescription={jobDetail?.description}
                />

                <div className="iv-action-panel">
                  <div>
                    <h3 className="iv-action-title">
                      Ready to move forward?
                    </h3>

                    <p className="iv-action-description">
                      Schedule the candidate interview and move
                      this application into the Interview
                      Scheduled stage.
                    </p>
                  </div>

                  <Button
                    type="button"
                    size="md"
                    variant="primary"
                    className="iv-primary-action"
                    onClick={() => setIsScheduleOpen(true)}
                  >
                    Schedule Interview
                  </Button>
                </div>
              </>
            ) : (
              <div className="iv-empty">
                <div className="iv-empty-icon">
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

                <h2 className="iv-empty-title">
                  Select a candidate
                </h2>

                <p className="iv-empty-description">
                  Choose an applicant from the candidate queue to
                  inspect the AI match analysis and schedule an
                  interview.
                </p>
              </div>
            )}
          </section>
        </div>
      )}

      {selectedApplication && isScheduleOpen && (
        <ScheduleInterviewModal
          isOpen
          mode="schedule"
          applicationId={selectedApplication.id}
          onClose={() => setIsScheduleOpen(false)}
          onSuccess={async () => {
            await advanceApplicationStage(
              selectedApplication.id,
              4,
              'Interview scheduled by the hiring team.',
            )

            setSuccessMessage(
              'Interview scheduled successfully. The application stage was updated.',
            )

            setSelectedAppId(null)

            await queryClient.invalidateQueries({
              queryKey: [
                'interview',
                'shortlisted-applications',
              ],
            })

            await queryClient.invalidateQueries({
              queryKey: ['interview', 'list'],
            })
          }}
        />
      )}
    </div>
  )
}

export default ShortlistReviewPage
