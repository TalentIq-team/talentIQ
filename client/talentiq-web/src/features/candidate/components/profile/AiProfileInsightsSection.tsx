import React from 'react'
import type { CandidateProfile } from '@/api/types'

interface AiProfileInsightsSectionProps {
  profile: CandidateProfile
}

export const AiProfileInsightsSection: React.FC<AiProfileInsightsSectionProps> = ({ profile }) => {
  const completion = profile.profileCompletionPercentage ?? 60
  const missing = profile.missingSectionSuggestions ?? []

  const strengths = [
    'Strong hands-on experience in core software development.',
    'Clear professional summary with defined technical goals.',
    profile.skills?.length ? `Proven skills in ${profile.skills.slice(0, 3).map(s => s.skillName || 'Skill').join(', ')}.` : 'Broad technical interest.',
  ]

  const recommendedSkills = ['Docker & Kubernetes', 'GraphQL APIs', 'CI/CD Pipelines', 'Cloud Architecture (AWS/Azure)']

  return (
    <div className="rounded-2xl border border-line bg-panel p-6 shadow-sm text-left space-y-6">
      <div className="border-b border-line pb-4">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-accent animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 3l1.8 4.6L18 9l-4.2 1.4L12 15l-1.8-4.6L6 9l4.2-1.4L12 3z" />
          </svg>
          <h3 className="font-display text-base font-bold text-head">
            Gemini AI Candidate Profile Diagnostics
          </h3>
        </div>
        <p className="text-xs text-muted mt-0.5">Automated AI recommendations to maximize recruiter match discovery and profile strength.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Profile Strengths */}
        <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
          <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            ✅ Highlighted Profile Strengths
          </h4>
          <ul className="space-y-1.5 text-xs text-text">
            {strengths.map((str, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Recommended Skill Additions */}
        <div className="p-4 rounded-xl bg-primary-500/5 border border-primary/20 space-y-2">
          <h4 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
            💡 Market-Demanded Recommended Skills
          </h4>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {recommendedSkills.map((sk) => (
              <span key={sk} className="px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 text-xs font-mono font-medium text-primary">
                + {sk}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Completion & Suggestions */}
      {missing.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-2">
          <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            ⚠️ Profile Completion Suggestions ({completion}% Complete)
          </h4>
          <p className="text-xs text-muted">Complete the following missing sections to achieve an All-Star recruitment badge:</p>
          <ul className="space-y-1 text-xs text-text list-disc list-inside">
            {missing.map((sec, i) => (
              <li key={i}>{sec}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default AiProfileInsightsSection
