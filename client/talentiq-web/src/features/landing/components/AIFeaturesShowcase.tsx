import React, { useState } from 'react'

interface MatchSample {
  title: string
  skills: string[]
  score: number
  tier: 'tier-elite' | 'tier-strong' | 'tier-fair' | 'tier-low'
  label: string
  badgeColor: string
  reason: string
}

const SAMPLE_PROFILES: MatchSample[] = [
  {
    title: 'Senior Frontend Architect',
    skills: ['React', 'TypeScript', 'TailwindCSS', 'Vite', 'State Management'],
    score: 94,
    tier: 'tier-elite',
    label: 'Elite AI Match',
    badgeColor: 'bg-accent-subtle text-accent border-accent/30',
    reason: 'Candidate demonstrates 94% skill overlap in modern React 19 architecture, TypeScript, and state design.',
  },
  {
    title: 'Full Stack .NET Developer',
    skills: ['C#', 'ASP.NET Core', 'SQL Server', 'REST API', 'React'],
    score: 78,
    tier: 'tier-strong',
    label: 'Strong Match',
    badgeColor: 'bg-primary-500/10 text-primary border-primary/20',
    reason: 'Solid alignment with core backend C# APIs and relational database architecture.',
  },
  {
    title: 'Cloud DevOps Specialist',
    skills: ['Docker', 'Kubernetes', 'CI/CD', 'Linux'],
    score: 55,
    tier: 'tier-fair',
    label: 'Fair Match',
    badgeColor: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    reason: 'Matches containerization and CI/CD basics, but lacks primary GCP infrastructure experience.',
  },
]

export const AIFeaturesShowcase: React.FC = () => {
  const [selectedProfile, setSelectedProfile] = useState<number>(0)
  const sample = SAMPLE_PROFILES[selectedProfile]

  const circumference = 2 * Math.PI * 42
  const strokeDashoffset = circumference - (circumference * sample.score) / 100

  return (
    <section id="ai-matching" className="py-16 md:py-24 border-b border-line bg-surface relative overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute top-1/2 left-0 w-80 h-80 bg-accent-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="font-mono text-xs font-semibold text-accent tracking-widest uppercase mb-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-subtle border border-accent/20">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3l1.8 4.6L18 9l-4.2 1.4L12 15l-1.8-4.6L6 9l4.2-1.4L12 3z"/></svg>
            02 / Gemini AI Engine
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-head tracking-tight mt-2">
            Explainable AI Match Scoring & Intelligence
          </h2>
          <p className="text-muted text-base mt-3 leading-relaxed">
            TalentIQ uses Gemini LLMs to analyze candidate resumes against job specifications. Every score is explainable with breakdown tags, removing guesswork from recruitment.
          </p>
        </div>

        {/* Feature Grid & Interactive Simulator */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Feature Highlights */}
          <div className="lg:col-span-6 space-y-6">
            
            <div className="p-6 rounded-2xl bg-panel border border-line shadow-sm hover:border-accent/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-accent-subtle text-accent flex items-center justify-center mb-4">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4M8 16h.01M16 16h.01"/></svg>
              </div>
              <h3 className="font-display font-semibold text-xl text-head mb-2">
                Automated Resume Skill Extraction
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                Upload PDF or DOCX resumes to extract technical competencies, experience duration, and project context automatically.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-panel border border-line shadow-sm hover:border-primary/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-primary-500/10 text-primary flex items-center justify-center mb-4">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
              </div>
              <h3 className="font-display font-semibold text-xl text-head mb-2">
                Explainable Skill Overlap Matrix
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                View instant visual feedback highlighting matched skills vs missing requirements, ensuring unbiased shortlisting.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-panel border border-line shadow-sm hover:border-emerald-500/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <h3 className="font-display font-semibold text-xl text-head mb-2">
                Talent Pool Consent & Privacy
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                Candidates maintain explicit control over their profile consent, allowing recruiters to safely re-engage active candidates.
              </p>
            </div>

          </div>

          {/* Right Column: Live Interactive Score Simulator Widget */}
          <div className="lg:col-span-6">
            <div className="glass-ai-panel shadow-xl">
              
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-line">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3l1.8 4.6L18 9l-4.2 1.4L12 15l-1.8-4.6L6 9l4.2-1.4L12 3z"/></svg>
                  <span className="font-display font-bold text-base text-head">
                    Live Match Score Simulator
                  </span>
                </div>
                <span className="text-xs font-mono text-muted">Interactive Demo</span>
              </div>

              {/* Selector Buttons */}
              <div className="flex flex-wrap gap-2 mb-6">
                {SAMPLE_PROFILES.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedProfile(idx)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer ${
                      selectedProfile === idx
                        ? 'bg-accent text-white shadow-sm'
                        : 'bg-panel-2 text-muted hover:text-head border border-line'
                    }`}
                  >
                    Profile {idx + 1} ({p.score}%)
                  </button>
                ))}
              </div>

              {/* Display Ring & Evaluation */}
              <div className="bg-panel rounded-2xl p-6 border border-line text-center flex flex-col items-center">
                
                {/* SVG Ring */}
                <div className={`score-ring-container ${sample.tier} w-28 h-28 mb-4`}>
                  <svg viewBox="0 0 100 100" className="w-28 h-28">
                    <circle className="score-ring-bg" cx="50" cy="50" r="42" />
                    <circle
                      className="score-ring-fg"
                      cx="50"
                      cy="50"
                      r="42"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-display font-bold text-2xl text-head tabular-nums">
                      {sample.score}%
                    </span>
                    <span className="text-[10px] font-mono text-muted uppercase">Match</span>
                  </div>
                </div>

                <span className={`px-3 py-1 rounded-full text-xs font-mono font-semibold border mb-3 ${sample.badgeColor}`}>
                  {sample.label}
                </span>

                <h4 className="font-display font-semibold text-lg text-head mb-1">
                  {sample.title}
                </h4>

                <p className="text-xs text-muted mb-4 max-w-sm">
                  {sample.reason}
                </p>

                {/* Skill Chips */}
                <div className="flex flex-wrap justify-center gap-1.5">
                  {sample.skills.map((skill, sIdx) => (
                    <span
                      key={sIdx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-mono border border-emerald-500/20"
                    >
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
                      {skill}
                    </span>
                  ))}
                </div>

              </div>

              {/* Notice */}
              <div className="mt-4 text-center">
                <span className="text-[11px] text-muted font-mono">
                  Gemini API v1.0 · Multi-vector candidate ranking system
                </span>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  )
}
export default AIFeaturesShowcase
