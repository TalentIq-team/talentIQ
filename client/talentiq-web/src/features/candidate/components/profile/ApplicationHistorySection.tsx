import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { getCandidateApplications } from '@/api/endpoints'
import { ApplicationStageLabels } from '@/api/types'
import { Spinner } from '@/components/Feedback'

interface ApplicationHistorySectionProps {
  candidateProfileId: string
}

export const ApplicationHistorySection: React.FC<ApplicationHistorySectionProps> = ({ candidateProfileId }) => {
  const { data: applications, isLoading, isError } = useQuery({
    queryKey: ['candidate-applications-history', candidateProfileId],
    queryFn: () => getCandidateApplications(candidateProfileId),
    enabled: !!candidateProfileId,
  })

  if (isLoading) return <Spinner label="Loading application history..." />

  return (
    <div className="rounded-2xl border border-line bg-panel p-6 shadow-sm text-left">
      <div className="border-b border-line pb-4 mb-4">
        <h3 className="font-display text-base font-bold text-head flex items-center gap-2">
          📑 Application History & Pipeline Status
        </h3>
        <p className="text-xs text-muted mt-0.5">Read-only live tracking of your job applications and recruitment stages.</p>
      </div>

      {isError || !applications || applications.length === 0 ? (
        <div className="text-center py-8 text-xs text-muted border border-dashed rounded-xl p-4">
          No job applications submitted yet. Browse open positions in the Job Search tab to apply.
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map((app) => (
            <div key={app.id} className="p-4 rounded-xl bg-panel-2/30 border border-line/60 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-bold text-head">Application #{app.id.slice(0, 8)}</h4>
                <p className="text-[11px] font-mono text-muted">Applied: {new Date(app.appliedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
              </div>

              <div className="flex items-center gap-3">
                {app.aiMatchScore && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-accent/10 text-accent border border-accent/20">
                    Match: {app.aiMatchScore}%
                  </span>
                )}
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-primary-500/10 text-primary border border-primary/20">
                  {ApplicationStageLabels[app.stage] || 'Applied'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ApplicationHistorySection
