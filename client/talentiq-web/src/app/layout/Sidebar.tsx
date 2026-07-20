import React from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import logo from '@/assets/logo.jpeg'
interface SidebarProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

interface NavItem {
  to: string
  label: string
  icon: React.ReactNode
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const { user, logout } = useAuth()

  if (!user) return null

  // Icons catalog
  const icons = {
    profile: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    jobs: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    tracker: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
    pool: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    postings: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    hmList: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    scorecard: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.961 0 1.36 1.242.588 1.81l-3.97 2.883a1 1 0 00-.364 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.971-2.883a1 1 0 00-1.18 0l-3.97 2.883c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.364-1.118l-3.97-2.883c-.768-.567-.369-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
    users: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    org: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    analytics: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  }

  // Navigation mapping by role
  const roleNav: Record<string, NavItem[]> = {
    Candidate: [
      { to: '/candidate/profile', label: 'My Profile', icon: icons.profile },
      { to: '/candidate/jobs', label: 'Job Search', icon: icons.jobs },
      { to: '/candidate/applications', label: 'My Applications', icon: icons.tracker },
      { to: '/candidate/talent-pool', label: 'Talent Pool Consent', icon: icons.pool },
    ],
    Recruiter: [
      { to: '/recruiter/jobs', label: 'Job Postings', icon: icons.postings },
      { to: '/recruiter/talent-pool', label: 'Talent Pool', icon: icons.pool },
    ],
    HiringManager: [
      { to: '/hiring-manager/shortlist', label: 'Shortlist Review', icon: icons.hmList },
      { to: '/hiring-manager/evaluations', label: 'Evaluations', icon: icons.scorecard },
    ],
    Admin: [
      { to: '/admin/users', label: 'User Management', icon: icons.users },
      { to: '/admin/organization', label: 'Org & Departments', icon: icons.org },
      { to: '/admin/analytics', label: 'KPI Dashboard', icon: icons.analytics },
    ],
  }

  const items = roleNav[user.role] || []

  return (
    <aside
      className={`fixed top-0 bottom-0 left-0 z-20 flex flex-col w-64 bg-panel border-r border-line transition-all duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0`}
    >
      {/* Brand Logo Header */}
      <div className="flex items-center gap-3">
  <img
    src={logo}
    alt="TalentIQ logo"
    className="h-9 w-9 rounded-lg object-cover"
  />

  <span className="text-lg font-bold text-head">
    TalentIQ
  </span>
</div>

      {/* Role Tag Banner */}
      <div className="px-6 py-3 border-b border-line bg-ink/40">
        <div className="text-[10px] font-bold uppercase tracking-wider text-muted mb-0.5">Portal Portal</div>
        <div className="text-xs font-semibold text-head flex items-center gap-1.5">
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{
              backgroundColor:
                user.role === 'Candidate'
                  ? 'var(--color-m3)'
                  : user.role === 'Recruiter'
                  ? 'var(--color-m2)'
                  : user.role === 'HiringManager'
                  ? 'var(--color-m4)'
                  : 'var(--color-m6)',
            }}
          />
          {user.role} Portal
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl border border-transparent transition-all duration-150 ${
                isActive
                  ? 'bg-panel-2 text-head border-line/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]'
                  : 'text-muted hover:text-head hover:bg-panel-2/40'
              }`
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Profile Card Footer */}
      <div className="p-4 border-t border-line bg-panel-2/30">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-line flex items-center justify-center text-head font-bold text-sm">
            {user.email.substring(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-head truncate">{user.email}</p>
            <p className="text-[10px] font-medium text-muted uppercase tracking-wider truncate">
              {user.role}
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center justify-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl border border-line bg-panel-2 hover:bg-alert/10 hover:border-alert/30 text-muted hover:text-alert transition-all duration-150 cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign Out
        </button>
      </div>
    </aside>
  )
}
export default Sidebar
