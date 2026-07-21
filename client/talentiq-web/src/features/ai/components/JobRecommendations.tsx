import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { Spinner } from '@/components/Feedback'
import { Link } from 'react-router-dom'
import './AiPanels.css'

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
      if (candidateProfileId === 'demo') {
        await new Promise((resolve) => setTimeout(resolve, 800))
        return [
          {
            jobId: 'demo-job-1',
            title: 'Senior Frontend Engineer (React/TypeScript)',
            matchPercentage: 94,
            matchedSkills: ['React', 'TypeScript', 'TailwindCSS', 'CSS3', 'HTML5', 'Git']
          },
          {
            jobId: 'demo-job-2',
            title: 'Full Stack Developer',
            matchPercentage: 78,
            matchedSkills: ['React', 'TypeScript', 'REST APIs', 'Git']
          },
          {
            jobId: 'demo-job-3',
            title: 'UI Developer & Web Specialist',
            matchPercentage: 72,
            matchedSkills: ['HTML5', 'CSS3', 'TailwindCSS', 'React', 'Git']
          },
          {
            jobId: 'demo-job-4',
            title: 'DevOps & Infrastructure Engineer',
            matchPercentage: 35,
            matchedSkills: ['Git']
          }
        ]
      }
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
      <div className={`ai-glass-panel text-center ${className}`}>
        <div className="py-6 text-muted text-xs flex flex-col items-center justify-center">
          <svg className="w-8 h-8 mb-2 text-muted/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-semibold text-head block mb-1">No AI Job Suggestions Available</span>
          Complete your profile skills to generate personalized matching job recommendations.
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="ai-glass-head mb-0">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M12 3l1.8 4.6L18 9l-4.2 1.4L12 15l-1.8-4.6L6 9l4.2-1.4L12 3z" />
          </svg>
          <b>AI Job Recommendations</b>
        </div>
        <span className="text-[10px] text-muted font-mono uppercase tracking-wider">Ranked by skill overlap</span>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {recommendations.slice(0, 4).map((rec) => {
          const isHighMatch = rec.matchPercentage >= 70
          const barColor = isHighMatch
            ? 'linear-gradient(90deg, #0466C8, #7B2CBF)'
            : 'linear-gradient(90deg, #5C677D, #0466C8)'
          const scoreTextColor = isHighMatch ? 'text-accent font-bold' : 'text-primary font-bold'

          return (
            <div
              key={rec.jobId}
              className="ai-glass-panel p-5 hover:border-accent/40 transition-all duration-200"
              style={{ padding: '20px' }}
            >
              <div className="space-y-3.5">
                <div>
                  <h4 className="text-xs font-bold text-head truncate leading-snug">{rec.title}</h4>
                  <p className="text-[10px] text-muted mt-0.5 font-medium">
                    Matched: {rec.matchedSkills.length} key {rec.matchedSkills.length === 1 ? 'skill' : 'skills'}
                  </p>
                </div>

                {/* Overlap Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[9.5px] font-semibold">
                    <span className="text-muted font-medium">Overlap score</span>
                    <span className={scoreTextColor}>{rec.matchPercentage}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-line/30 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${rec.matchPercentage}%`,
                        background: barColor,
                      }}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <Link to="/candidate/jobs" className="w-full">
                    <button
                      className="w-full text-[10px] py-1.5 h-8 border border-line rounded-lg font-semibold text-text bg-panel/50 hover:bg-panel hover:border-accent/30 transition-all cursor-pointer"
                    >
                      View Details &amp; Apply
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default JobRecommendations
