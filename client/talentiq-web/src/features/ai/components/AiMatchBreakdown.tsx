import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { Spinner } from '@/components/Feedback'
import FallbackBadge from './FallbackBadge'
import './AiPanels.css'

const analyzedApplications = new Set<string>()

interface AiMatchBreakdownProps {
  applicationId: string
  className?: string
}

interface AnalysisResult {
  id: string
  applicationId: string
  overallMatchScore: number
  matchedSkills: string[]
  missingSkills: string[]
  summary: string
  isFallbackExecution: boolean
  createdAt: string
}

export const AiMatchBreakdown: React.FC<AiMatchBreakdownProps> = ({ applicationId, className = '' }) => {
  const queryClient = useQueryClient()

  // Fetch the stored analysis breakdown
  const { data: analysis, isLoading, isError, refetch } = useQuery<AnalysisResult>({
    queryKey: ['ai-analysis', applicationId],
    queryFn: async () => {
      if (applicationId.startsWith('demo')) {
        await new Promise((resolve) => setTimeout(resolve, 800))
        if (applicationId === 'demo-empty' && !analyzedApplications.has(applicationId)) {
          return null
        }
        return {
          id: 'demo-analysis-id',
          applicationId,
          overallMatchScore: 88,
          matchedSkills: ['React', 'TypeScript', 'TailwindCSS', 'REST APIs', 'Git', 'HTML5', 'CSS3'],
          missingSkills: ['Docker', 'GraphQL'],
          summary: 'The candidate demonstrates strong experience with frontend technologies, especially React and TypeScript. They have a solid history of building scalable user interfaces and integrating with RESTful APIs. However, they lack direct experience with Docker containerization and GraphQL, which are listed as nice-to-haves in the job posting. Overall, they are highly qualified and recommended for an interview.',
          isFallbackExecution: false,
          createdAt: new Date().toISOString(),
        }
      }
      const { data } = await apiClient.get(`/api/ai/analysis/${applicationId}`)
      return data
    },
    enabled: !!applicationId,
    retry: false, // If not found, let the user trigger analysis
  })

  // Mutation to analyze resume manually
  const analyzeMutation = useMutation({
    mutationFn: async () => {
      if (applicationId.startsWith('demo')) {
        await new Promise((resolve) => setTimeout(resolve, 1500))
        analyzedApplications.add(applicationId)
        return { success: true }
      }
      // Find candidate profile and job details through application
      const appRes = await apiClient.get(`/api/v1/applications/${applicationId}`)
      const appData = appRes.data
      const jobRes = await apiClient.get(`/api/v1/jobs/${appData.jobPostingId}`)
      const jobData = jobRes.data
      const profileRes = await apiClient.get(`/api/v1/candidates/profile/${appData.candidateProfileId}`)
      const profileData = profileRes.data

      // Get skills for the job to pass as required
      const requiredSkillNames = await Promise.all(
        (jobData.skillIds || []).map(async (id: string) => {
          try {
            const skillRes = await apiClient.get(`/api/v1/skills/${id}`)
            return skillRes.data.name
          } catch {
            return id
          }
        })
      )

      const requiredSkills = requiredSkillNames.length > 0 ? requiredSkillNames : ['React', 'TypeScript']

      const { data } = await apiClient.post('/api/ai/analyze', {
        applicationId,
        resumeText: profileData.professionalSummary || 'Experience and credentials parsed from candidate profile details.',
        requiredSkills,
      })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-analysis', applicationId] })
      refetch()
    },
  })

  if (isLoading) return <Spinner label="Fetching AI scorecard..." />

  if (isError || !analysis) {
    return (
      <div className={`ai-glass-panel ${className}`}>
        <div className="text-center space-y-4 py-6">
          <div className="w-12 h-12 bg-m3/10 rounded-full flex items-center justify-center mx-auto text-m3">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 3l1.8 4.6L18 9l-4.2 1.4L12 15l-1.8-4.6L6 9l4.2-1.4L12 3z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-head">No AI Match Breakdown</h3>
            <p className="text-xs text-muted mt-1">Generate an AI matching analysis by parsing this candidate's resume.</p>
          </div>
          <button
            onClick={() => analyzeMutation.mutate()}
            disabled={analyzeMutation.isPending}
            className="btn-ai-accent text-xs h-9 px-4 py-2"
          >
            {analyzeMutation.isPending ? 'Analyzing Resume...' : 'Trigger AI Analysis'}
          </button>
        </div>
      </div>
    )
  }

  const score = analysis.overallMatchScore
  const tierClass =
    score >= 90
      ? 'score-tier-elite'
      : score >= 70
      ? 'score-tier-strong'
      : score >= 50
      ? 'score-tier-fair'
      : 'score-tier-low'

  const tierBadge =
    score >= 90 ? (
      <span className="ai-chip-neutral" style={{ background: 'rgba(123, 44, 191, 0.08)', color: '#7B2CBF', borderColor: 'rgba(123, 44, 191, 0.15)' }}>AI Optimal</span>
    ) : score >= 70 ? (
      <span className="ai-chip-neutral">Strong Match</span>
    ) : score >= 50 ? (
      <span className="ai-chip-neutral">Fair Match</span>
    ) : (
      <span className="ai-chip-neutral">Low Match</span>
    )

  // Circular progress: strokeDasharray="264", strokeDashoffset = 264 * (1 - score / 100)
  const offset = 264 * (1 - score / 100)

  return (
    <div className={`ai-glass-panel ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-line pb-4 mb-4">
        <div className="ai-glass-head mb-0">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M12 3l1.8 4.6L18 9l-4.2 1.4L12 15l-1.8-4.6L6 9l4.2-1.4L12 3z" />
          </svg>
          <b>AI Candidate Analysis</b>
        </div>
        <FallbackBadge isFallback={analysis.isFallbackExecution} />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Match Circle Score */}
        <div className="flex flex-col items-center justify-center p-4 rounded-xl border border-line bg-panel-2/10 text-center">
          <div className={`ai-score-ring ${tierClass}`}>
            <svg viewBox="0 0 100 100" width="84" height="84">
              <circle className="bg" cx="50" cy="50" r="42" />
              <circle
                className="fg"
                cx="50"
                cy="50"
                r="42"
                strokeDasharray="264"
                strokeDashoffset={offset}
              />
            </svg>
            <span className="val">{score}%</span>
          </div>
          <div className="mt-3">
            {tierBadge}
          </div>
        </div>

        {/* Details & Reasoning */}
        <div className="md:col-span-2 space-y-4">
          <div>
            <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted mb-1.5">Engagement Recommendation</h4>
            <div className="ai-glass-rec">
              <b style={{ color: 'var(--color-head)', display: 'block', marginBottom: '4px', fontSize: '12px' }}>AI Summary Explanation</b>
              {analysis.summary}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Matched Skills */}
            <div>
              <h5 className="text-[10px] font-bold uppercase tracking-wider text-ok mb-2 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-ok" />
                Matched Skills ({analysis.matchedSkills.length})
              </h5>
              <div className="flex flex-wrap gap-1.5">
                {analysis.matchedSkills.length === 0 ? (
                  <span className="text-xs text-muted italic">None detected</span>
                ) : (
                  analysis.matchedSkills.map((skill) => (
                    <span key={skill} className="ai-chip-match">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-2.5 h-2.5">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                      {skill}
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Missing Skills */}
            <div>
              <h5 className="text-[10px] font-bold uppercase tracking-wider text-alert mb-2 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-alert" />
                Missing Required ({analysis.missingSkills.length})
              </h5>
              <div className="flex flex-wrap gap-1.5">
                {analysis.missingSkills.length === 0 ? (
                  <span className="text-xs text-muted italic">None missing</span>
                ) : (
                  analysis.missingSkills.map((skill) => (
                    <span key={skill} className="ai-chip-missing">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-2.5 h-2.5">
                        <circle cx="12" cy="12" r="9" />
                        <path d="M12 8v5M12 16h.01" />
                      </svg>
                      {skill}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Manual analysis trigger */}
      <div className="mt-5 border-t border-line/50 pt-3.5 flex justify-end">
        <button
          onClick={() => analyzeMutation.mutate()}
          disabled={analyzeMutation.isPending}
          className="btn-ai-accent text-xs h-9 px-4 py-2"
        >
          {analyzeMutation.isPending ? 'Analyzing Resume...' : 'Re-Analyze Resume'}
        </button>
      </div>
    </div>
  )
}

export default AiMatchBreakdown
