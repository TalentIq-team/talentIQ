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
  roles: string[]
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const { user, logout } = useAuth()

  if (!user) return null

  // SVGs for Lucide-like icons
  const icons = {
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

  // Entire catalog of routes focusing on Job Searching and Talent Matching.
  const navigationItems: NavItem[] = [
    { to: '/candidate/jobs', label: 'Job Search', icon: icons.jobs, roles: ['Candidate'] },
    { to: '/recruiter/jobs', label: 'Job Management', icon: icons.jobs, roles: ['Admin', 'Recruiter'] },
    { to: '/recruiter/talent-pool', label: 'Talent Pool & AI Match', icon: icons.pool, roles: ['Admin', 'Recruiter'] },
    { to: '/candidate/talent-pool', label: 'Talent Match Consent', icon: icons.pool, roles: ['Candidate'] },
    { to: '/candidate/applications', label: 'My Applications', icon: icons.notifications, roles: ['Candidate'] },
    { to: '/candidate/profile', label: 'My Profile & Skills', icon: icons.candidates, roles: ['Candidate'] },
    { to: '/admin/users', label: 'Candidates Directory', icon: icons.candidates, roles: ['Admin', 'Recruiter'] },
    { to: '/hiring-manager/evaluations', label: 'Interviews & Reviews', icon: icons.interviews, roles: ['Admin', 'HiringManager', 'Recruiter'] },
    { to: '/hiring-manager/shortlist', label: 'Talent Shortlists', icon: icons.managers, roles: ['Admin', 'HiringManager', 'Recruiter'] },
    { to: '/admin/analytics', label: 'Recruitment Analytics', icon: icons.analytics, roles: ['Admin', 'Recruiter', 'HiringManager'] },
  ]

  const filteredItems = navigationItems.filter((item) => item.roles.includes(user.role))

  return (
    <aside
      className={`fixed top-0 bottom-0 left-0 z-20 flex flex-col w-64 bg-[#001233] border-r border-white/10 transition-all duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 shadow-xl`}
    >
      {/* Centered Brand Logo Header */}
      <div className="flex flex-col items-center justify-center pt-7 pb-6 px-4 border-b border-white/10 bg-[#001845]/50 text-center">
        <div className="relative mb-3 group">
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[#2D7FDE] to-[#7B2CBF] opacity-50 blur-md group-hover:opacity-75 transition-opacity"></div>
          <img
            src={logo}
            alt="TalentIQ logo"
            className="relative h-14 w-14 rounded-2xl object-cover border border-white/20 shadow-xl"
          />
        </div>
        <h1 className="text-xl font-bold text-white tracking-wide">
          TalentIQ
        </h1>
        <span className="text-[10px] font-semibold text-white/60 tracking-wider uppercase mt-1">
          Job Search & Talent Matching
        </span>
      </div>

      {/* Role Tag Banner */}
      <div className="px-5 py-3 border-b border-white/10 bg-[#001233]/90">
        <div className="text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1">
          Active Workspace
        </div>
        <div className="text-xs font-semibold text-white flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full ring-2 ring-white/20"
            style={{
              backgroundColor:
                user.role === 'Candidate'
                  ? '#38bdf8'
                  : user.role === 'Recruiter'
                  ? '#818cf8'
                  : user.role === 'HiringManager'
                  ? '#fb7185'
                  : '#a78bfa',
            }}
          />
          {user.role} Workspace
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

        {/* Global Settings Link */}
        <div className="pt-4 border-t border-white/10 space-y-1">
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
          className="flex w-full items-center justify-center gap-2 px-3 py-2.5 text-xs font-semibold rounded-xl border border-white/10 bg-white/5 hover:bg-red-500/20 hover:border-red-500/30 text-white/80 hover:text-white transition-all duration-150 cursor-pointer"
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

