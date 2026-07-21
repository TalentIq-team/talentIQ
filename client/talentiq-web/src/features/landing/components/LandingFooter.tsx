import React from 'react'
import { Link } from 'react-router-dom'
import logo from '@/assets/logo.jpeg'

export const LandingFooter: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="bg-surface border-t border-line pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-line">
          
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 opacity-50 blur-sm"></div>
                <img
                  src={logo}
                  alt="TalentIQ Logo"
                  className="relative w-8 h-8 rounded-xl object-cover border border-white/20 shadow-sm"
                />
              </div>
              <span className="font-display font-bold text-xl text-head">
                TalentIQ
              </span>
            </div>
            <p className="text-xs text-muted leading-relaxed max-w-sm">
              Unified AI-native recruitment platform integrating candidate management, Gemini resume matching, and enterprise role portals into a single token-driven interface.
            </p>
            <div className="flex items-center gap-2 text-xs font-mono text-muted">
              <svg className="w-4 h-4 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <span>WCAG AA Accessibility Compliant</span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-display font-semibold text-sm text-head uppercase tracking-wider">
              Quick Navigation
            </h4>
            <ul className="space-y-2 text-xs text-muted font-medium">
              <li><a href="#jobs" className="hover:text-head transition-colors">Browse Job Postings</a></li>
              <li><a href="#ai-matching" className="hover:text-head transition-colors">AI Match Simulator</a></li>
              <li><a href="#platform" className="hover:text-head transition-colors">Platform Architecture</a></li>
              <li><a href="#stats" className="hover:text-head transition-colors">Performance & Security</a></li>
            </ul>
          </div>

          {/* Role Portals */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="font-display font-semibold text-sm text-head uppercase tracking-wider">
              System Access
            </h4>
            <div className="flex flex-wrap gap-2">
              <Link to="/login" className="px-3 py-1.5 rounded-lg bg-panel-2 border border-line text-xs font-mono text-text hover:border-primary transition-colors">
                Candidate Login
              </Link>
              <Link to="/login" className="px-3 py-1.5 rounded-lg bg-panel-2 border border-line text-xs font-mono text-text hover:border-accent transition-colors">
                Recruiter Portal
              </Link>
              <Link to="/login" className="px-3 py-1.5 rounded-lg bg-panel-2 border border-line text-xs font-mono text-text hover:border-amber-500 transition-colors">
                Hiring Manager
              </Link>
              <Link to="/login" className="px-3 py-1.5 rounded-lg bg-panel-2 border border-line text-xs font-mono text-text hover:border-emerald-500 transition-colors">
                Admin Console
              </Link>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-muted">
          <div>
            © 2026 TalentIQ Platform · SE205.3 Software Architecture & Design System
          </div>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 py-1 px-3 rounded-full bg-panel-2 border border-line hover:text-head transition-colors cursor-pointer"
          >
            Back to Top
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
          </button>
        </div>

      </div>
    </footer>
  )
}
export default LandingFooter
