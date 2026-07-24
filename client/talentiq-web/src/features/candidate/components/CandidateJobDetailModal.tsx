import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { JobPosting } from '@/api/types'
import { EmploymentTypeLabels } from '@/api/types'
import { compareJobWithCandidate, getCandidateProfile, type JobComparisonResult } from '@/api/endpoints'
import { Spinner } from '@/components/Feedback'
import FallbackBadge from '@/features/ai/components/FallbackBadge'
import '@/features/ai/components/AiPanels.css'

interface CandidateJobDetailModalProps {
  job: JobPosting | null
  onClose: () => void
  onApply: (jobId: string) => void
  isApplied?: boolean
  appliedText?: string
  candidateProfileId?: string | null
}

export const CandidateJobDetailModal: React.FC<CandidateJobDetailModalProps> = ({
  job,
  onClose,
  onApply,
  isApplied = false,
  appliedText,
  candidateProfileId,
}) => {
  const [showComparison, setShowComparison] = useState(false)

  // Query candidate profile
  const profileQuery = useQuery({
    queryKey: ['candidate-profile', candidateProfileId],
    queryFn: async () => {
      if (!candidateProfileId) return null
      try {
        return await getCandidateProfile(candidateProfileId)
      } catch (err) {
        console.warn('Could not fetch candidate profile by ID, using default candidate profile context:', err)
        return null
      }
    },
    enabled: !!candidateProfileId && showComparison,
  })


  // Comparison query via Gemini API
  const comparisonQuery = useQuery<JobComparisonResult>({
    queryKey: ['job-compare-ai', job?.id, candidateProfileId],
    queryFn: async () => {
      if (!job) throw new Error('Job not found')

      const profile = profileQuery.data
      const candidateSummary = profile?.professionalSummary || 'Dedicated professional seeking candidate placement.'
      const candidateSkills = (profile?.skills || []).map((s) => s.skillName)
      const candidateExperience = profile?.yearsOfExperience || 1

      return compareJobWithCandidate({
        jobTitle: job.title,
        jobDescription: job.description || '',
        jobRequiredSkills: job.skillIds || [],
        minExperienceYears: job.minExperienceYears || 0,
        candidateSummary,
        candidateSkills,
        candidateYearsOfExperience: candidateExperience,
        candidateResumeText: profile?.professionalSummary,
      })
    },
    enabled: showComparison && !!job && (!candidateProfileId || profileQuery.isSuccess),
  })

  if (!job) return null

  const comparison = comparisonQuery.data
  const isLoadingAi = profileQuery.isLoading || comparisonQuery.isLoading

  const score = comparison?.overallMatchScore ?? 0
  const tierClass =
    score >= 85
      ? 'score-tier-elite'
      : score >= 70
      ? 'score-tier-strong'
      : score >= 50
      ? 'score-tier-fair'
      : 'score-tier-low'

  const strokeOffset = 264 * (1 - score / 100)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl bg-panel border border-line rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col text-left">
        
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-line flex items-start justify-between bg-surface/80">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-primary-500/10 text-primary border border-primary/20">
                {EmploymentTypeLabels[job.employmentType] || 'Full Time'}
              </span>
              <span className="text-[11px] font-mono text-muted">Job Ref: {job.id.slice(0, 8)}...</span>
            </div>
            <h2 className="font-display text-2xl font-bold text-head tracking-tight">
              {job.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="w-9 h-9 rounded-xl bg-panel-2 hover:bg-line flex items-center justify-center text-muted hover:text-head transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Key Attributes */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-panel-2/60 border border-line">
            <div>
              <span className="text-[11px] text-muted block font-mono">Location</span>
              <span className="text-xs font-semibold text-head flex items-center gap-1 mt-0.5">
                <svg className="w-3.5 h-3.5 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {job.location || 'Remote'}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-muted block font-mono">Min Experience</span>
              <span className="text-xs font-semibold text-head flex items-center gap-1 mt-0.5">
                <svg className="w-3.5 h-3.5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v6l4 2" />
                </svg>
                {job.minExperienceYears}+ Years
              </span>
            </div>
            <div>
              <span className="text-[11px] text-muted block font-mono">Position Status</span>
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1 mt-0.5">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
                Open & Accepting
              </span>
            </div>
          </div>

          {/* Role Description */}
          <div>
            <h3 className="font-display font-bold text-sm text-head mb-2 uppercase tracking-wider">
              Role Summary & Overview
            </h3>
            <p className="text-xs text-text leading-relaxed whitespace-pre-line bg-panel-2/20 p-4 rounded-xl border border-line/40">
              {job.description || 'No detailed description provided.'}
            </p>
          </div>

          {/* Required Skills */}
          {job.skillIds && job.skillIds.length > 0 && (
            <div>
              <h3 className="font-display font-bold text-xs text-head mb-2 uppercase tracking-wider">
                Required Technical Competencies
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {job.skillIds.map((skill, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg bg-primary-500/10 border border-primary/20 text-xs font-mono font-medium text-primary"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Compare Me AI Section Trigger */}
          {!showComparison && (
            <div className="p-5 rounded-2xl border border-accent/30 bg-gradient-to-r from-accent/10 via-primary/5 to-transparent flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1 max-w-md">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-accent animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 3l1.8 4.6L18 9l-4.2 1.4L12 15l-1.8-4.6L6 9l4.2-1.4L12 3z" />
                  </svg>
                  <h4 className="font-bold text-sm text-head">Gemini AI Candidate Comparison</h4>
                </div>
                <p className="text-xs text-muted leading-relaxed">
                  Click <strong>Compare Me</strong> to run Google Gemini AI analysis comparing your candidate CV and profile against this job opening.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowComparison(true)}
                className="btn-ai-accent text-xs h-10 px-5 py-2 flex items-center gap-2 rounded-xl font-bold cursor-pointer shadow-lg hover:scale-105 transition-transform"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 3l1.8 4.6L18 9l-4.2 1.4L12 15l-1.8-4.6L6 9l4.2-1.4L12 3z" />
                </svg>
                Compare Me with Gemini AI
              </button>
            </div>
          )}

          {/* Gemini AI Comparison Analysis Report */}
          {showComparison && (
            <div className="ai-glass-panel space-y-5 animate-fade-in border-accent/40">
              <div className="flex items-center justify-between border-b border-line pb-3">
                <div className="ai-glass-head mb-0">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-accent">
                    <path d="M12 3l1.8 4.6L18 9l-4.2 1.4L12 15l-1.8-4.6L6 9l4.2-1.4L12 3z" />
                  </svg>
                  <b className="text-sm">Gemini AI Job Match Analysis</b>
                </div>
                {comparison && <FallbackBadge isFallback={comparison.isFallbackExecution} />}
              </div>

              {isLoadingAi && (
                <div className="py-8 text-center space-y-3">
                  <Spinner label="Calling Gemini AI agent to analyze your CV against job requirements..." />
                </div>
              )}

              {comparisonQuery.isError && (
                <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-xs text-red-400 text-center">
                  ⚠️ AI Comparison error: {(comparisonQuery.error as Error).message || 'Unable to connect to Gemini service.'}
                </div>
              )}

              {comparison && !isLoadingAi && (
                <div className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-3 items-center">
                    {/* Score Circle */}
                    <div className="flex flex-col items-center justify-center p-4 rounded-xl border border-line bg-panel-2/20 text-center">
                      <div className={`ai-score-ring ${tierClass}`}>
                        <svg viewBox="0 0 100 100" width="84" height="84">
                          <circle className="bg" cx="50" cy="50" r="42" />
                          <circle
                            className="fg"
                            cx="50"
                            cy="50"
                            r="42"
                            strokeDasharray="264"
                            strokeDashoffset={strokeOffset}
                          />
                        </svg>
                        <span className="val">{score}%</span>
                      </div>
                      <span className="text-[11px] font-mono font-bold mt-2 text-head uppercase tracking-wider">
                        Match Score
                      </span>
                    </div>

                    {/* Executive Summary */}
                    <div className="md:col-span-2 space-y-2">
                      <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-accent">
                        Gemini Executive Insights
                      </h4>
                      <p className="text-xs text-text leading-relaxed p-3.5 rounded-xl bg-panel-2/40 border border-line/50">
                        {comparison.executiveSummary}
                      </p>
                    </div>
                  </div>

                  {/* Strengths & Growth Areas */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Key Strengths */}
                    <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
                      <h5 className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                        Key Strengths ({comparison.keyStrengths.length})
                      </h5>
                      <ul className="space-y-1 text-xs text-text list-disc list-inside">
                        {comparison.keyStrengths.map((str, i) => (
                          <li key={i} className="leading-tight">{str}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Growth Areas & Missing Skills */}
                    <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-2">
                      <h5 className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="9" />
                          <path d="M12 8v5M12 16h.01" />
                        </svg>
                        Skill Gaps & Growth ({comparison.missingSkills.length})
                      </h5>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {comparison.missingSkills.length === 0 ? (
                          <span className="text-xs text-muted italic">No critical skill gaps identified!</span>
                        ) : (
                          comparison.missingSkills.map((sk) => (
                            <span key={sk} className="ai-chip-missing">
                              {sk}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  {/* AI Actionable Recommendations */}
                  {comparison.recommendations.length > 0 && (
                    <div className="p-4 rounded-xl bg-primary-500/5 border border-primary/20 space-y-2">
                      <h5 className="text-[11px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                        💡 Recommendations for Candidate
                      </h5>
                      <ul className="space-y-1.5 text-xs text-text">
                        {comparison.recommendations.map((rec, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-primary font-bold">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-line bg-surface/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {!showComparison && (
              <button
                type="button"
                onClick={() => setShowComparison(true)}
                className="btn-ai-accent text-xs h-9 px-4 py-2 flex items-center gap-1.5 rounded-xl font-bold cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 3l1.8 4.6L18 9l-4.2 1.4L12 15l-1.8-4.6L6 9l4.2-1.4L12 3z" />
                </svg>
                Compare Me
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold border border-line bg-panel hover:bg-panel-2 text-text transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              disabled={isApplied}
              onClick={() => onApply(job.id)}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isApplied
                  ? 'bg-panel-2 text-muted border border-line'
                  : 'bg-primary text-black hover:bg-primary/90 shadow-md'
              }`}
            >
              {appliedText || (isApplied ? 'Applied ✓' : 'Quick Apply')}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}

export default CandidateJobDetailModal
