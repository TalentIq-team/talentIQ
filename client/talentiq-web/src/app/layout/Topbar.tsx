import React, { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'

interface TopbarProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

interface NotificationItem {
  id: string
  recipientId: string
  subject: string
  body: string
  createdAt: string
  status: number
}

export const Topbar: React.FC<TopbarProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const { user } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('talentiq.theme')
    return (saved as 'light' | 'dark') || 'light'
  })

  // Theme Sync effect
  useEffect(() => {
    const root = window.document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem('talentiq.theme', theme)
  }, [theme])

  // Fetch notifications using React Query
  const { data: notifications = [] } = useQuery<NotificationItem[]>({
    queryKey: ['notifications'],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get('/api/v1/notifications')
        return data
      } catch (err) {
        console.error('Failed to fetch notifications from server, using stubs', err)
        return [
          {
            id: 'stub-1',
            recipientId: user?.userId || '',
            subject: 'Welcome to TalentIQ',
            body: 'Explore the recruitment portal, create profiles, jobs and review pipelines.',
            createdAt: new Date().toISOString(),
            status: 1,
          },
          {
            id: 'stub-2',
            recipientId: user?.userId || '',
            subject: 'AI Engine Initialized',
            body: 'Upload PDF resumes to parse candidate skills and compute match percentages.',
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            status: 1,
          }
        ]
      }
    },
    enabled: !!user,
    refetchInterval: 15000, // Poll every 15 seconds
  })

  // Local read tracker since the database schema lacks an isRead flag
  const [readNotifications, setReadNotifications] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('talentiq.read_notifications') || '[]')
    } catch {
      return []
    }
  })

  const unreadCount = notifications.filter((n) => !readNotifications.includes(n.id)).length

  const markAllRead = () => {
    const allIds = notifications.map((n) => n.id)
    setReadNotifications(allIds)
    localStorage.setItem('talentiq.read_notifications', JSON.stringify(allIds))
  }

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  // Close dropdown on click outside
  useEffect(() => {
    const handleClose = () => setDropdownOpen(false)
    window.addEventListener('click', handleClose)
    return () => window.removeEventListener('click', handleClose)
  }, [])

  const formatTime = (isoString: string) => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime()
      const diffMins = Math.floor(diffMs / 60000)
      if (diffMins < 1) return 'Just now'
      if (diffMins < 60) return `${diffMins}m ago`
      const diffHours = Math.floor(diffMins / 60)
      if (diffHours < 24) return `${diffHours}h ago`
      return new Date(isoString).toLocaleDateString()
    } catch {
      return 'Recent'
    }
  }

  return (
    <header className="sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b border-line bg-panel px-6 shadow-sm">
      {/* Mobile Toggle & Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={(e) => {
            e.stopPropagation()
            setSidebarOpen(!sidebarOpen)
          }}
          className="rounded-xl border border-line p-2 text-muted hover:text-head hover:bg-panel-2 md:hidden cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div>
          <h2 className="text-base font-semibold text-head">TalentIQ Portal</h2>
        </div>
      </div>

      {/* Action utilities */}
      <div className="flex items-center gap-3">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="rounded-xl border border-line p-2.5 text-muted hover:text-head hover:bg-panel-2 transition-all cursor-pointer"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? (
            // Moon Icon
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          ) : (
            // Sun Icon
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
            </svg>
          )}
        </button>

        {/* Notifications Icon Dropdown */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setDropdownOpen(!dropdownOpen)
            }}
            className="relative rounded-xl border border-line p-2.5 text-muted hover:text-head hover:bg-panel-2 transition-all cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-alert text-[9px] font-bold text-white ring-2 ring-panel">
                {unreadCount}
              </span>
            )}
          </button>

          {dropdownOpen && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 mt-3 w-80 rounded-2xl border border-line bg-panel shadow-lg p-2 animate-fade-in"
            >
              <div className="flex items-center justify-between border-b border-line px-4 py-3">
                <span className="text-xs font-bold text-head uppercase tracking-wider">
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-[10px] font-semibold text-m2 hover:text-head transition-all cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-line/60">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-muted">No notifications.</div>
                ) : (
                  notifications.map((item) => {
                    const isRead = readNotifications.includes(item.id)
                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          if (!isRead) {
                            const updated = [...readNotifications, item.id]
                            setReadNotifications(updated)
                            localStorage.setItem('talentiq.read_notifications', JSON.stringify(updated))
                          }
                        }}
                        className={`px-4 py-3.5 hover:bg-panel-2/45 transition-colors cursor-pointer ${
                          !isRead ? 'bg-panel-2/20 border-l-2 border-m2' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className={`text-xs font-semibold ${
                              !isRead ? 'text-head' : 'text-muted'
                            }`}
                          >
                            {item.subject}
                          </span>
                          <span className="text-[10px] text-muted">{formatTime(item.createdAt)}</span>
                        </div>
                        <p className="text-xs text-muted leading-relaxed truncate-2-lines">
                          {item.body}
                        </p>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Card info (Header display) */}
        <div className="hidden sm:flex items-center gap-2.5 rounded-xl border border-line bg-panel-2/40 px-3 py-1.5">
          <div className="w-6.5 h-6.5 rounded-full bg-m2 flex items-center justify-center text-[10px] font-bold text-button-primary-text uppercase">
            {user?.email ? user.email.charAt(0) : 'U'}
          </div>
          <span className="text-xs font-semibold text-head">{user?.email || 'User Account'}</span>
        </div>
      </div>
    </header>
  )
}
export default Topbar
