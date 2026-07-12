import { NavLink, Outlet } from 'react-router-dom'

const NAV = [
  { to: '/candidate/profile', label: 'My Profile' },
  { to: '/candidate/jobs', label: 'Job Search' },
  { to: '/candidate/applications', label: 'My Applications' },
  { to: '/recruiter/jobs', label: 'Job Postings' },
]

function App() {
  return (
    <div className="min-h-full bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-6 py-4">
          <span className="text-lg font-bold text-indigo-600">TalentIQ</span>
          <nav className="flex flex-wrap gap-1">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  )
}

export default App
