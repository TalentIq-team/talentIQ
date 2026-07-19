import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient, toErrorMessage } from '@/lib/api'
import { Spinner, ErrorBanner, EmptyState } from '@/components/Feedback'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import StageBadge from '@/components/ui/StageBadge'
import AiMatchBreakdown from '@/features/ai/components/AiMatchBreakdown'
import ScheduleInterviewModal from '../components/ScheduleInterviewModal'

interface CandidateSummary {
  id: string
  jobPostingId: string
  candidateProfileId: string
  stage: number
  aiMatchScore: number | null
  appliedAt: string
}

export const ShortlistReviewPage: React.FC = () => {
  const queryClient = useQueryClient()
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null)
  const [selectedCandidateEmail, setSelectedCandidateEmail] = useState<string>('')
  const [isScheduleOpen, setIsScheduleOpen] = useState(false)

  // Query applications in 'Shortlisted' stage (stage = 3)
  const { data: applications = [], isLoading, isError, error } = useQuery<CandidateSummary[]>({
    queryKey: ['shortlisted-applications'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/v1/applications/search', {
        params: { stage: 3 },
      })
      return data
    },
  })

  const handleOpenSchedule = (appId: string) => {
    setSelectedAppId(appId)
    // Pre-fill a dummy email based on applicant details for dev simplicity
    setSelectedCandidateEmail(`applicant.${appId.substring(0, 4)}@talentiq.dev`)
    setIsScheduleOpen(true)
  }

  if (isLoading) return <Spinner label="Loading shortlisted candidates..." />
  if (isError) return <ErrorBanner message={toErrorMessage(error)} />

  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <h1 className="text-2xl font-black text-head tracking-tight">Shortlist Review</h1>
        <p className="text-xs text-muted mt-1">Review top-tier candidate matches and schedule interviews.</p>
      </header>

      {applications.length === 0 ? (
        <EmptyState message="No candidates have been shortlisted for review yet." />
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Candidates List Column */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-xs font-bold text-head uppercase tracking-wider mb-2">Shortlisted Applicants</h3>
            <div className="space-y-3">
              {applications.map((app) => {
                const isSelected = selectedAppId === app.id
                return (
                  <Card
                    key={app.id}
                    variant="glass"
                    onClick={() => {
                      setSelectedAppId(app.id)
                      setSelectedCandidateEmail(`applicant.${app.id.substring(0, 4)}@talentiq.dev`)
                    }}
                    className={`p-4 border transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'border-m2/70 bg-m2/5 ring-1 ring-m2/30'
                        : 'border-line hover:border-line-2'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
                          Applicant ID: {app.id.substring(0, 8)}
                        </span>
                        <StageBadge stage={app.stage} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-head">
                          Profile ID: {app.candidateProfileId.substring(0, 8)}
                        </h4>
                        <p className="text-[10px] text-muted mt-0.5">
                          Applied: {new Date(app.appliedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-m2 font-bold bg-m2/10 px-1.5 py-0.5 rounded-md">
                          Score: {app.aiMatchScore ? `${app.aiMatchScore}%` : 'N/A'}
                        </span>
                        <span className="text-[9px] text-muted">Click to view breakdown</span>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Candidate AI Matching breakdown Column */}
          <div className="lg:col-span-2 space-y-4">
            {selectedAppId ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-bold text-head uppercase tracking-wider mb-2">Match Analysis</h3>
                  <AiMatchBreakdown applicationId={selectedAppId} />
                </div>

                <div className="flex justify-end gap-3 p-4 bg-panel rounded-2xl border border-line">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => handleOpenSchedule(selectedAppId)}
                  >
                    Schedule Interview
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-48 border border-dashed border-line rounded-2xl bg-panel/30 text-xs text-muted">
                Select an applicant from the list to view their AI match analysis and schedule interviews.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Schedule Interview Modal Overlay */}
      {selectedAppId && (
        <ScheduleInterviewModal
          isOpen={isScheduleOpen}
          onClose={() => setIsScheduleOpen(false)}
          applicationId={selectedAppId}
          candidateEmail={selectedCandidateEmail}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['shortlisted-applications'] })
            alert('Interview has been scheduled successfully. Notification sent.')
          }}
        />
      )}
    </div>
  )
}

export default ShortlistReviewPage
