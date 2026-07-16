import React, { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'

interface TopbarProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

interface NotificationItem {
  id: string
  title: string
  message: string
  time: string
  read: boolean
}

export const Topbar: React.FC<TopbarProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const { user } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: '1',
      title: 'Interview Scheduled',
      message: 'Your interview for Frontend Lead has been scheduled for tomorrow.',
      time: '1h ago',
      read: false,
    },
    {
      id: '2',
      title: 'Consent Request',
      message: 'Recruiter asked to add you to the Talent Pool.',
      time: '5h ago',
      read: false,
    },
    {
      id: '3',
      title: 'Profile Improvement Report',
      message: 'Your monthly re-engagement scorecard is ready.',
      time: '1d ago',
      read: true,
    },
  ])

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  // Close dropdown on click outside
  useEffect(() => {
    const handleClose = () => setDropdownOpen(false)
    window.addEventListener('click', handleClose)
    return () => window.removeEventListener('click', handleClose)
  }, [])

  return (
    <header className="sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b border-line bg-glass px-6">
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
          <h2 className="text-base font-semibold text-head">Workspace Dashboard</h2>
        </div>
      </div>

      {/* Action utilities */}
      <div className="flex items-center gap-4">
        {/* Notifications Icon Dropdown */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setDropdownOpen(!dropdownOpen)
            }}
            className="relative rounded-xl border border-line p-2.5 text-muted hover:text-head hover:bg-panel transition-all cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-alert text-[9px] font-bold text-white ring-2 ring-panel animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {dropdownOpen && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 mt-3 w-80 rounded-2xl border border-line bg-panel shadow-2xl p-2 animate-fade-in"
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
                  notifications.map((item) => (
                    <div
                      key={item.id}
                      className={`px-4 py-3.5 hover:bg-panel-2/45 transition-colors cursor-pointer ${
                        !item.read ? 'bg-panel-2/15' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`text-xs font-semibold ${
                            !item.read ? 'text-head' : 'text-muted'
                          }`}
                        >
                          {item.title}
                        </span>
                        <span className="text-[10px] text-muted">{item.time}</span>
                      </div>
                      <p className="text-xs text-muted leading-relaxed truncate-2-lines">
                        {item.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Card info (Header display) */}
        <div className="hidden sm:flex items-center gap-2.5 rounded-xl border border-line bg-panel-2/40 px-3 py-1.5">
          <div className="w-6.5 h-6.5 rounded-full bg-m2 flex items-center justify-center text-[10px] font-bold text-white">
            {user?.email.charAt(0).toUpperCase()}
          </div>
          <span className="text-xs font-semibold text-head">{user?.email}</span>
        </div>
      </div>
    </header>
  )
}
export default Topbar
