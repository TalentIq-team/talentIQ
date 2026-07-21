import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { Spinner, ErrorBanner } from '@/components/Feedback'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import FallbackBadge from './FallbackBadge'

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
  const { data: analysis, isLoading, isError, error, refetch } = useQuery<AnalysisResult>({
    queryKey: ['ai-analysis', applicationId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/api/ai/analysis/${applicationId}`)
      return data
    },
    enabled: !!applicationId,
    retry: false, // If not found, let the user trigger analysis
  })

  // Mutation to analyze resume manually
  const analyzeMutation = useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post(`/api/v1/applications/${applicationId}/analyze`)
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
      <Card variant="glass" className={`p-6 border border-line ${className}`}>
        <div className="text-center space-y-4 py-4">
          <div className="w-12 h-12 bg-m2/10 rounded-full flex items-center justify-center mx-auto text-m2">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-head">No AI Match Breakdown</h3>
            <p className="text-xs text-muted mt-1">Generate an AI matching analysis by parsing this candidate's resume.</p>
          </div>
          <Button
            size="sm"
            onClick={() => analyzeMutation.mutate()}
            isLoading={analyzeMutation.isPending}
            variant="primary"
          >
            Trigger AI Analysis
          </Button>
        </div>
      </Card>
    )
  }

  const scoreColor =
    analysis.overallMatchScore >= 80
      ? 'text-ok border-ok/20 bg-ok/5'
      : analysis.overallMatchScore >= 50
      ? 'text-m6 border-m6/20 bg-m6/5'
      : 'text-alert border-alert/20 bg-alert/5'

  return (
    <Card variant="glass" className={`p-6 border border-line ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-line pb-4 mb-4">
        <div>
          <h3 className="text-sm font-bold text-head uppercase tracking-wider">AI Matching Breakdown</h3>
          <p className="text-[10px] text-muted mt-0.5">
            Analyzed on {new Date(analysis.createdAt).toLocaleDateString()}
          </p>
        </div>
        <FallbackBadge isFallback={analysis.isFallbackExecution} />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Match Circle Score */}
        <div className="flex flex-col items-center justify-center p-4 rounded-xl border border-line/60 bg-panel-2/20 text-center">
          <div className="relative flex items-center justify-center w-24 h-24">
            {/* SVG circle track and indicator */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="38"
                className="stroke-line"
                strokeWidth="6"
                fill="transparent"
              />
              <circle
                cx="48"
                cy="48"
                r="38"
                stroke="currentColor"
                strokeWidth="6"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 38}
                strokeDashoffset={2 * Math.PI * 38 * (1 - analysis.overallMatchScore / 100)}
                className={
                  analysis.overallMatchScore >= 80
                    ? 'text-ok'
                    : analysis.overallMatchScore >= 50
                    ? 'text-m6'
                    : 'text-alert'
                }
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-2xl font-black text-head">{analysis.overallMatchScore}%</span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-muted">Score</span>
            </div>
          </div>
          <span className={`mt-3 px-2 py-0.5 text-[9px] font-bold rounded-lg border uppercase tracking-wider ${scoreColor}`}>
            {analysis.overallMatchScore >= 80
              ? 'Excellent Match'
              : analysis.overallMatchScore >= 50
              ? 'Good Match'
              : 'Weak Match'}
          </span>
        </div>

        {/* Details & Reasoning */}
        <div className="md:col-span-2 space-y-4">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted mb-1.5">AI Recommendation Explanation</h4>
            <p className="text-xs text-text leading-relaxed bg-panel-2/30 p-3.5 rounded-xl border border-line/50">
              {analysis.summary}
            </p>
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
                    <span
                      key={skill}
                      className="px-2 py-1 text-[10px] font-medium bg-ok/10 text-ok border border-ok/10 rounded-lg"
                    >
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
                    <span
                      key={skill}
                      className="px-2 py-1 text-[10px] font-medium bg-alert/10 text-alert border border-alert/10 rounded-lg"
                    >
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
        <Button
          size="sm"
          onClick={() => analyzeMutation.mutate()}
          isLoading={analyzeMutation.isPending}
          variant="outline"
          className="text-xs h-9"
        >
          Re-Analyze Resume
        </Button>
      </div>
    </Card>
  )
}

export default AiMatchBreakdown
