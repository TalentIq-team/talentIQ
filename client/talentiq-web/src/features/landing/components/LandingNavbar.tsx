import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import logo from '@/assets/logo.jpeg'

export const LandingNavbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const [isDark, setIsDark] = useState<boolean>(() => {
    return document.documentElement.classList.contains('dark') ||
      localStorage.getItem('talentiq.theme') === 'dark'
  })

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('talentiq.theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('talentiq.theme', 'light')
    }
  }, [isDark])

  const toggleTheme = () => {
    setIsDark(prev => !prev)
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-40 w-full bg-glass border-b border-line transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Lockup */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative group">
            <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 opacity-50 blur-sm group-hover:opacity-75 transition-opacity"></div>
            <img
              src={logo}
              alt="TalentIQ Logo"
              className="relative w-9 h-9 rounded-xl object-cover border border-white/20 shadow-md"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-lg tracking-tight text-head flex items-center gap-1.5">
              TalentIQ
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-accent-subtle text-accent border border-accent/20">
                <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3l1.8 4.6L18 9l-4.2 1.4L12 15l-1.8-4.6L6 9l4.2-1.4L12 3z"/></svg>
                AI Engine
              </span>
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted">
          <a href="#jobs" className="hover:text-head transition-colors flex items-center gap-1.5">
            <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
            Job Postings
          </a>
          <a href="#ai-matching" className="hover:text-head transition-colors flex items-center gap-1.5">
            <svg className="w-4 h-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 3l1.8 4.6L18 9l-4.2 1.4L12 15l-1.8-4.6L6 9l4.2-1.4L12 3z"/></svg>
            AI Matching
          </a>
          <a href="#platform" className="hover:text-head transition-colors">
            Platform Capabilities
          </a>
          <a href="#stats" className="hover:text-head transition-colors">
            Enterprise Impact
          </a>
        </nav>

        {/* Right Action Controls */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            type="button"
            className="w-9 h-9 rounded-xl border border-line bg-surface flex items-center justify-center text-muted hover:text-head hover:bg-panel-2 transition-all cursor-pointer"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle theme"
          >
            {isDark ? (
              <svg className="w-4 h-4 text-warning-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
            ) : (
              <svg className="w-4 h-4 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 12.8A9 9 0 1111.2 3 7 7 0 0021 12.8z"/></svg>
            )}
          </button>

          {/* Auth State CTAs */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2">
              <Link
                to={user.role === 'Candidate' ? '/candidate/jobs' : '/recruiter/jobs'}
                className="btn-design btn-design-primary text-xs sm:text-sm py-2 px-3 sm:px-4"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>
                Workspace ({user.role})
              </Link>
              <button
                onClick={handleLogout}
                className="w-9 h-9 rounded-xl border border-line bg-surface flex items-center justify-center text-muted hover:text-alert hover:bg-panel-2 transition-all cursor-pointer"
                title="Log out"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-sm font-semibold text-text hover:text-head px-3 py-2 rounded-lg hover:bg-panel-2 transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="btn-design btn-design-accent text-xs sm:text-sm py-2 px-3 sm:px-4"
              >
                Apply as Candidate
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
            </div>
          )}
        </div>

      </div>
    </header>
  )
}
export default LandingNavbar
