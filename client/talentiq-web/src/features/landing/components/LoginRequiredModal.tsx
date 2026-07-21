import React from 'react'
import { Link } from 'react-router-dom'
import type { JobPosting } from '@/api/types'

interface LoginRequiredModalProps {
  job: JobPosting | null
  onClose: () => void
}

export const LoginRequiredModal: React.FC<LoginRequiredModalProps> = ({ job, onClose }) => {
  if (!job) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-panel border border-line rounded-2xl shadow-2xl p-6 sm:p-8 text-left space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-panel-2 hover:bg-line flex items-center justify-center text-muted hover:text-head transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>

        {/* Lock Icon Lockup */}
        <div className="w-12 h-12 rounded-2xl bg-primary-500/10 border border-primary/20 flex items-center justify-center text-primary">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
        </div>

        {/* Title & Prompt */}
        <div>
          <span className="font-mono text-xs font-semibold text-accent uppercase tracking-wider block mb-1">
            Authentication Required
          </span>
          <h2 className="font-display text-2xl font-bold text-head tracking-tight mb-2">
            Log In to Apply
          </h2>
          <p className="text-sm text-muted leading-relaxed">
            You are applying for{' '}
            <span className="font-semibold text-head underline decoration-primary/40">
              {job.title}
            </span>
            . Please sign in to your candidate account or register to complete your application with 1-click AI resume matching.
          </p>
        </div>

        {/* AI Advantage Callout */}
        <div className="p-4 rounded-xl bg-accent-subtle/50 border border-accent/20 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-accent">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3l1.8 4.6L18 9l-4.2 1.4L12 15l-1.8-4.6L6 9l4.2-1.4L12 3z"/></svg>
            <span>Why Join TalentIQ?</span>
          </div>
          <ul className="text-xs text-muted space-y-1.5 list-disc list-inside">
            <li>Instant Gemini AI match score calculation for every job posting</li>
            <li>Track your application stage in real-time</li>
            <li>Opt-in to the Talent Pool for recruiter re-engagement</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            to={`/login?redirect=${encodeURIComponent(`/`)}`}
            className="btn-design btn-design-primary flex-1 justify-center py-2.5"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/><path d="M10 17l5-5-5-5"/><path d="M15 12H3"/></svg>
            Log In
          </Link>
          <Link
            to={`/register?role=Candidate`}
            className="btn-design btn-design-accent flex-1 justify-center py-2.5"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/></svg>
            Create Candidate Account
          </Link>
        </div>

        {/* Privacy Note */}
        <div className="text-center pt-2">
          <span className="text-[11px] font-mono text-muted flex items-center justify-center gap-1">
            <svg className="w-3.5 h-3.5 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            100% Secure & Private. No spam ever.
          </span>
        </div>

      </div>
    </div>
  )
}
export default LoginRequiredModal
