import React from 'react'
import type { JobPosting } from '@/api/types'
import { EmploymentTypeLabels } from '@/api/types'

interface JobDetailModalProps {
  job: JobPosting | null
  onClose: () => void
  onApply: (job: JobPosting) => void
}

export const JobDetailModal: React.FC<JobDetailModalProps> = ({ job, onClose, onApply }) => {
  if (!job) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-panel border border-line rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-line flex items-start justify-between bg-surface">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-primary-500/10 text-primary border border-primary/20">
                {EmploymentTypeLabels[job.employmentType] || 'Full Time'}
              </span>
              <span className="text-xs font-mono text-muted">Ref: {job.id}</span>
            </div>
            <h2 className="font-display text-2xl font-bold text-head tracking-tight">
              {job.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-panel-2 hover:bg-line flex items-center justify-center text-muted hover:text-head transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-panel-2 border border-line">
            <div>
              <span className="text-xs text-muted block font-mono">Location</span>
              <span className="text-sm font-medium text-head flex items-center gap-1 mt-0.5">
                <svg className="w-3.5 h-3.5 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                {job.location}
              </span>
            </div>
            <div>
              <span className="text-xs text-muted block font-mono">Min Experience</span>
              <span className="text-sm font-medium text-head flex items-center gap-1 mt-0.5">
                <svg className="w-3.5 h-3.5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 7v6l4 2"/></svg>
                {job.minExperienceYears}+ Years
              </span>
            </div>
            <div>
              <span className="text-xs text-muted block font-mono">Verification</span>
              <span className="text-sm font-medium text-emerald-500 flex items-center gap-1 mt-0.5">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M9 12l2 2 4-4"/></svg>
                Active & Verified
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-display font-semibold text-base text-head mb-2">
              Role Summary & Requirements
            </h3>
            <p className="text-sm text-text leading-relaxed whitespace-pre-line">
              {job.description}
            </p>
          </div>

          {/* Required Skills */}
          <div>
            <h3 className="font-display font-semibold text-base text-head mb-2">
              Required Technical Competencies
            </h3>
            <div className="flex flex-wrap gap-2">
              {job.skillIds.map((skill, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-lg bg-primary-500/10 border border-primary/20 text-xs font-mono font-medium text-primary"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Gemini AI Intelligence Banner */}
          <div className="glass-ai-panel">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3l1.8 4.6L18 9l-4.2 1.4L12 15l-1.8-4.6L6 9l4.2-1.4L12 3z"/></svg>
              <span className="font-display font-semibold text-sm text-head">
                Gemini Candidate Match Preview
              </span>
            </div>
            <p className="text-xs text-muted leading-relaxed mb-3">
              When logged in, TalentIQ automatically evaluates your candidate profile and resume against this position's key requirements to output an explainable match score.
            </p>
            <div className="flex items-center gap-2 text-xs font-mono text-accent">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <span>Automated Skill Gap & Compatibility Parsing</span>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-line bg-surface flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="btn-design btn-design-secondary text-sm"
          >
            Close
          </button>
          <button
            onClick={() => onApply(job)}
            className="btn-design btn-design-primary text-sm"
          >
            Apply for Position
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        </div>

      </div>
    </div>
  )
}
export default JobDetailModal
