import React from 'react'

export const PlatformStats: React.FC = () => {
  return (
    <section id="stats" className="py-16 md:py-24 border-b border-line bg-surface/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="font-mono text-xs font-semibold text-primary tracking-widest uppercase mb-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-500/10 border border-primary/20">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 5-6"/></svg>
            03 / Platform Performance
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-head tracking-tight mt-2">
            Enterprise Architecture & Metrics
          </h2>
          <p className="text-muted text-base mt-3">
            Designed for high performance, accessibility compliance, and secure role-based collaboration.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          
          <div className="p-6 rounded-2xl bg-panel border border-line shadow-sm space-y-2">
            <div className="w-9 h-9 rounded-xl bg-primary-500/10 text-primary flex items-center justify-center mb-3">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
            </div>
            <span className="font-display text-3xl sm:text-4xl font-bold text-head tabular-nums block">
              428+
            </span>
            <span className="text-xs font-medium text-muted block">
              Pooled Active Candidates
            </span>
          </div>

          <div className="p-6 rounded-2xl bg-panel border border-line shadow-sm space-y-2">
            <div className="w-9 h-9 rounded-xl bg-accent-subtle text-accent flex items-center justify-center mb-3">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3l1.8 4.6L18 9l-4.2 1.4L12 15l-1.8-4.6L6 9l4.2-1.4L12 3z"/></svg>
            </div>
            <span className="font-display text-3xl sm:text-4xl font-bold text-head tabular-nums block">
              76.4%
            </span>
            <span className="text-xs font-medium text-muted block">
              Gemini Skill Match Precision
            </span>
          </div>

          <div className="p-6 rounded-2xl bg-panel border border-line shadow-sm space-y-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-3">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 7v6l4 2"/></svg>
            </div>
            <span className="font-display text-3xl sm:text-4xl font-bold text-head tabular-nums block">
              10x
            </span>
            <span className="text-xs font-medium text-muted block">
              Faster Resume Screening
            </span>
          </div>

          <div className="p-6 rounded-2xl bg-panel border border-line shadow-sm space-y-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-3">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M9 12l2 2 4-4"/></svg>
            </div>
            <span className="font-display text-3xl sm:text-4xl font-bold text-head tabular-nums block">
              100%
            </span>
            <span className="text-xs font-medium text-muted block">
              WCAG AA Accessibility Rating
            </span>
          </div>

        </div>

        {/* 4 Portals Matrix Showcase */}
        <div id="platform" className="bg-panel border border-line rounded-3xl p-6 sm:p-10 shadow-md">
          <div className="max-w-2xl mb-8">
            <span className="font-mono text-xs font-semibold text-accent uppercase tracking-wider block mb-1">
              Unified Security & Access
            </span>
            <h3 className="font-display text-2xl font-bold text-head">
              One System, Four Dedicated Portals
            </h3>
            <p className="text-sm text-muted mt-1">
              Role Guards enforce strict permission boundaries while sharing the same underlying design language.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="p-5 rounded-2xl bg-panel-2 border border-line space-y-3">
              <div className="w-8 h-8 rounded-lg bg-primary-500/10 text-primary flex items-center justify-center">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/><path d="M16 11l2 2 4-4"/></svg>
              </div>
              <h4 className="font-display font-semibold text-base text-head">Candidate Portal</h4>
              <p className="text-xs text-muted leading-relaxed">
                Profile setup, resume upload, 1-click application submission, and stage tracking.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-panel-2 border border-line space-y-3">
              <div className="w-8 h-8 rounded-lg bg-accent-subtle text-accent flex items-center justify-center">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
              </div>
              <h4 className="font-display font-semibold text-base text-head">Recruiter Workspace</h4>
              <p className="text-xs text-muted leading-relaxed">
                Job posting manager, candidate pipeline drag-and-drop Kanban, and talent pool outreach.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-panel-2 border border-line space-y-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 5-6"/></svg>
              </div>
              <h4 className="font-display font-semibold text-base text-head">Hiring Manager</h4>
              <p className="text-xs text-muted leading-relaxed">
                Interview scheduling, candidate evaluation rubrics, and team decision feedback.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-panel-2 border border-line space-y-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
              </div>
              <h4 className="font-display font-semibold text-base text-head">Admin Console</h4>
              <p className="text-xs text-muted leading-relaxed">
                User management, security audit log monitoring, system configuration, and analytics.
              </p>
            </div>

          </div>
        </div>

      </div>
    </section>
  )
}
export default PlatformStats
