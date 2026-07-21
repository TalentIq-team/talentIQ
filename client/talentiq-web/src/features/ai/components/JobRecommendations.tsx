import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { Spinner } from '@/components/Feedback'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { Link } from 'react-router-dom'

interface JobRecommendationsProps {
  candidateProfileId: string
  className?: string
}

interface JobRecommendation {
  jobId: string
  title: string
  matchPercentage: number
  matchedSkills: string[]
}

export const JobRecommendations: React.FC<JobRecommendationsProps> = ({
  candidateProfileId,
  className = '',
}) => {
  const { data: recommendations = [], isLoading, isError } = useQuery<JobRecommendation[]>({
    queryKey: ['job-recommendations', candidateProfileId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/api/v1/candidates/${candidateProfileId}/recommended-jobs`)
      // Convert to clean format
      return (data || []).map((rec: any) => ({
        jobId: rec.JobId || rec.jobId || '',
        title: rec.Title || rec.title || '',
        matchPercentage: rec.MatchPercentage ?? rec.matchPercentage ?? 0,
        matchedSkills: rec.MatchedSkills || rec.matchedSkills || [],
      }))
    },
    enabled: !!candidateProfileId,
  })

  if (isLoading) return <Spinner label="Loading AI recommendations..." />

  if (isError || recommendations.length === 0) {
    return (
      <Card variant="glass" className={`p-6 text-center ${className}`}>
        <div className="py-4 text-muted text-xs">
          <svg className="w-8 h-8 mx-auto mb-2 text-muted/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          No matching job recommendations found. Complete your profile skills to view suggestions.
        </div>
      </Card>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-head uppercase tracking-wider">AI Skill Match Recommendations</h3>
        <span className="text-[10px] text-muted font-medium">Ranked by skill overlap</span>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {recommendations.slice(0, 4).map((rec) => (
          <Card key={rec.jobId} variant="glass" className="p-4 hover:border-m2/40 transition-all duration-200" hoverEffect>
            <div className="space-y-3">
              <div>
                <h4 className="text-xs font-bold text-head truncate">{rec.title}</h4>
                <p className="text-[10px] text-muted mt-0.5">Matched: {rec.matchedSkills.length} skills</p>
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-semibold">
                  <span className="text-muted">Overlap score</span>
                  <span className={rec.matchPercentage >= 70 ? 'text-ok' : 'text-m6'}>{rec.matchPercentage}%</span>
                </div>
                <div className="w-full h-1.5 bg-line/50 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      rec.matchPercentage >= 70 ? 'bg-ok' : 'bg-m6'
                    }`}
                    style={{ width: `${rec.matchPercentage}%` }}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <Link to="/candidate/jobs" className="w-full">
                  <Button variant="outline" size="sm" className="w-full text-[10px] py-1.5 h-8">
                    View Details
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default JobRecommendations
