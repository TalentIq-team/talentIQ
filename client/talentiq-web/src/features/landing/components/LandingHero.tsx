import React from 'react'

export const LandingHero: React.FC = () => {
  return (
    <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 border-b border-line">
      {/* Background Radial Glow Effects */}
      <div className="absolute inset-0 pointer-events-none bg-radial-gradient" />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto flex flex-col items-center">
          
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold tracking-wider uppercase bg-accent-subtle text-accent border border-accent/30 shadow-sm mb-6">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3l1.8 4.6L18 9l-4.2 1.4L12 15l-1.8-4.6L6 9l4.2-1.4L12 3z"/></svg>
            TalentIQ v1.0 · AI-Powered Enterprise Recruitment
          </div>

          {/* Main Display Headline */}
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-head leading-[1.1] mb-6">
            Connecting Top Talent with Future Roles using{' '}
            <span className="bg-gradient-to-r from-primary-500 via-primary-400 to-accent-400 bg-clip-text text-transparent">
              Gemini Intelligence
            </span>
          </h1>

          {/* Lead Paragraph */}
          <p className="text-base sm:text-lg lg:text-xl text-muted leading-relaxed max-w-2xl mb-8">
            Browse verified job postings, inspect explainable skill match scores, and apply seamlessly. Powered by a unified 70-20-10 design system across Candidate, Recruiter, Hiring Manager, and Admin portals.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
            <a
              href="#jobs"
              className="btn-design btn-design-primary btn-lg shadow-lg hover:shadow-primary-500/20"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
              Explore Open Roles
            </a>
            <a
              href="#ai-matching"
              className="btn-design btn-design-accent btn-lg shadow-lg hover:shadow-accent-500/20"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3l1.8 4.6L18 9l-4.2 1.4L12 15l-1.8-4.6L6 9l4.2-1.4L12 3z"/></svg>
              AI Match Simulator
            </a>
          </div>

          {/* Trust & Platform Badges */}
          <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-4 text-xs sm:text-sm font-medium">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-line shadow-sm text-text">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-dot" />
              AI Engine Online
            </span>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-line shadow-sm text-text">
              <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M9 12l2 2 4-4"/></svg>
              WCAG AA Verified
            </span>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-line shadow-sm text-text">
              <svg className="w-4 h-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>
              4 Role-Based Portals
            </span>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-line shadow-sm text-text">
              <svg className="w-4 h-4 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              Data Privacy & Security
            </span>
          </div>

        </div>

        {/* Quick Jump Indicator */}
        <div className="mt-12 flex justify-center">
          <a
            href="#jobs"
            className="flex items-center gap-2 text-xs font-mono text-muted hover:text-primary transition-colors py-1 px-3 rounded-full border border-line bg-surface/50"
          >
            Scroll to Live Job Openings
            <svg className="w-3.5 h-3.5 animate-bounce" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
          </a>
        </div>

      </div>
    </section>
  )
}
export default LandingHero
