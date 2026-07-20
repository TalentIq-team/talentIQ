import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

interface SidebarProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

interface NavItem {
  to: string
  label: string
  icon: React.ReactNode
  roles: string[]
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const { user, logout } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')

  if (!user) return null

  // SVGs for Lucide-like icons
  const icons = {
    dashboard: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
      </svg>
    ),
    recruitment: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    jobs: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    candidates: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    interviews: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    managers: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    pool: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016zM12 9v2m0 4h.01" />
      </svg>
    ),
    analytics: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    notifications: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
    settings: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  }

  // Entire catalog of routes. Access is filtered by active role.
  const navigationItems: NavItem[] = [
    { to: '/dashboard', label: 'Dashboard', icon: icons.dashboard, roles: ['Admin', 'Recruiter', 'HiringManager', 'Candidate'] },
    { to: '/recruiter/jobs', label: 'Job Management', icon: icons.jobs, roles: ['Admin', 'Recruiter'] },
    { to: '/candidate/jobs', label: 'Job Search', icon: icons.recruitment, roles: ['Candidate'] },
    { to: '/candidate/profile', label: 'My Profile', icon: icons.candidates, roles: ['Candidate'] },
    { to: '/admin/users', label: 'Candidates', icon: icons.candidates, roles: ['Admin', 'Recruiter'] },
    { to: '/hiring-manager/evaluations', label: 'Interviews', icon: icons.interviews, roles: ['Admin', 'HiringManager', 'Recruiter'] },
    { to: '/hiring-manager/shortlist', label: 'Hiring Managers', icon: icons.managers, roles: ['Admin', 'HiringManager', 'Recruiter'] },
    { to: '/recruiter/talent-pool', label: 'Talent Pool', icon: icons.pool, roles: ['Admin', 'Recruiter'] },
    { to: '/candidate/talent-pool', label: 'Talent Pool Consent', icon: icons.pool, roles: ['Candidate'] },
    { to: '/admin/analytics', label: 'Analytics', icon: icons.analytics, roles: ['Admin', 'Recruiter', 'HiringManager'] },
  ]

  // Filter items by role and search query
  const filteredItems = navigationItems
    .filter((item) => item.roles.includes(user.role))
    .filter((item) => item.label.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <aside
      className={`fixed top-0 bottom-0 left-0 z-20 flex flex-col w-64 bg-[#001233] border-r border-white/10 transition-all duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 shadow-xl`}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center px-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <img
            src="/TalentIQ-mark.png"
            alt="TalentIQ logo"
            className="h-9 w-9 rounded-xl bg-white object-contain p-0.5 shadow-md ring-1 ring-[#7B2CBF]/40"
          />
          <span className="text-lg font-bold font-display tracking-tight text-white">
            TalentIQ
          </span>
        </div>
      </div>

      {/* Search Input */}
      <div className="px-4 py-3 border-b border-white/10 bg-white/5">
        <div className="relative">
          <input
            type="text"
            placeholder="Search menu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:border-[#2D7FDE] focus:ring-1 focus:ring-[rgba(45,127,222,0.25)] outline-none transition-all duration-150"
          />
          <svg className="absolute left-3 top-2.5 w-3.5 h-3.5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {filteredItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setIsOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 text-xs font-medium rounded-xl border border-transparent transition-all duration-200 ${
                isActive
                  ? 'bg-[#002855] text-[#63A3EC] border-l-2 border-[#2D7FDE] font-bold'
                  : 'text-white/70 hover:text-white hover:bg-[#002855]/70'
              }`
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}

        {/* Global Settings & Notifications Links */}
        <div className="pt-4 border-t border-white/10 space-y-1">
          <NavLink
            to="/candidate/applications"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 text-xs font-medium rounded-xl border border-transparent transition-all duration-200 ${
                isActive
                  ? 'bg-[#002855] text-[#63A3EC] border-l-2 border-[#2D7FDE] font-bold'
                  : 'text-white/70 hover:text-white hover:bg-[#002855]/70'
              }`
            }
          >
            {icons.notifications}
            Notifications
          </NavLink>
          <div
            onClick={() => alert('Settings are configured by system administrators.')}
            className="flex items-center gap-3 px-4 py-3 text-xs font-medium rounded-xl text-white/70 hover:text-white hover:bg-[#002855]/70 cursor-pointer transition-all duration-200"
          >
            {icons.settings}
            Settings
          </div>
        </div>
      </nav>

      {/* Footer / Profile */}
      <div className="p-4 border-t border-white/10 bg-white/5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0466C8] to-[#7B2CBF] flex items-center justify-center text-white font-bold text-sm uppercase shadow-sm">
            {user.email.substring(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">{user.email.split('@')[0]}</p>
            <p className="text-[10px] font-semibold text-white/50 uppercase tracking-wider truncate">
              {user.role}
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center justify-center gap-2 px-3 py-2.5 text-xs font-semibold rounded-xl border border-white/10 bg-white/5 hover:bg-alert/15 hover:border-alert/30 text-white/80 hover:text-white transition-all duration-150 cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>
    </aside>
  )
}
export default Sidebar
