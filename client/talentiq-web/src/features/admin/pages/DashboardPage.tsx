import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

export const DashboardPage: React.FC = () => {
  const { user } = useAuth()

  // Fallback / standard KPI values (6 Enterprise cards)
  const stats = [
    {
      title: 'Total Candidates',
      value: '1,280',
      change: '+12% vs last month',
      trend: [900, 950, 1020, 1080, 1150, 1210, 1280],
      icon: (
        <svg className="w-5 h-5 text-m2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      positive: true,
    },
    {
      title: 'Active Jobs',
      value: '12',
      change: '+4% vs last month',
      trend: [8, 9, 10, 10, 11, 12, 12],
      icon: (
        <svg className="w-5 h-5 text-m2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      positive: true,
    },
    {
      title: 'AI Match Score',
      value: '84%',
      change: '+1.8% vs last month',
      trend: [80, 81, 81.5, 82.3, 83.1, 83.6, 84.0],
      icon: (
        <svg className="w-5 h-5 text-m2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      positive: true,
    },
    {
      title: 'Interviews Scheduled',
      value: '18',
      change: '+15% vs last month',
      trend: [8, 10, 12, 11, 14, 16, 18],
      icon: (
        <svg className="w-5 h-5 text-m2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      positive: true,
    },
    {
      title: 'Hiring Rate',
      value: '15.4%',
      change: '+2.5% vs last month',
      trend: [13.0, 13.5, 14.1, 14.0, 14.8, 15.0, 15.4],
      icon: (
        <svg className="w-5 h-5 text-m2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      positive: true,
    },
    {
      title: 'Time to Hire',
      value: '24d',
      change: '-3d vs last month',
      trend: [29, 28, 27, 26, 25, 25, 24],
      icon: (
        <svg className="w-5 h-5 text-m2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      positive: true, // positive here means favorable drop in cycle time
    },
  ]

  // Pipeline summary rows (8 custom columns mapping to ATS stages)
  const pipelineRows = [
    { position: 'Senior Python Engineer', total: 25, applied: 5, aiScreening: 6, hrReview: 4, techInterview: 6, finalInterview: 2, offer: 1, hired: 1, rejected: 0 },
    { position: 'Middle Data Science Engineer', total: 23, applied: 7, aiScreening: 4, hrReview: 3, techInterview: 4, finalInterview: 2, offer: 2, hired: 0, rejected: 1 },
    { position: 'Junior Java Engineer', total: 32, applied: 14, aiScreening: 8, hrReview: 4, techInterview: 3, finalInterview: 1, offer: 1, hired: 1, rejected: 0 },
    { position: 'Middle Software Architect', total: 21, applied: 9, aiScreening: 5, hrReview: 2, techInterview: 2, finalInterview: 2, offer: 1, hired: 0, rejected: 0 },
  ]

  // Custom SVG path drawing for trend sparklines
  const drawSparkline = (points: number[]) => {
    const width = 100
    const height = 30
    const max = Math.max(...points)
    const min = Math.min(...points)
    const range = max - min || 1
    const step = width / (points.length - 1)
    
    return points
      .map((p, idx) => {
        const x = idx * step
        const y = height - ((p - min) / range) * (height - 4) - 2
        return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`
      })
      .join(' ')
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <header>
        <h1 className="text-2xl font-black tracking-tight text-head">
          Good Morning, {user?.email ? (user.email.split('@')[0] === 'admin' ? 'Mary' : user.email.split('@')[0].charAt(0).toUpperCase() + user.email.split('@')[0].slice(1)) : 'Mary'}
        </h1>
        <p className="text-xs text-muted mt-1">Here is what is happening across your recruitment pipelines today.</p>
      </header>

      {/* KPI Statistic Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        {stats.map((card, idx) => (
          <Card key={idx} variant="glass" className="p-4 flex flex-col justify-between h-36 relative" hoverEffect>
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold uppercase tracking-wider text-muted truncate">
                {card.title}
              </span>
              <div className="p-1.5 rounded-xl bg-panel-2 border border-line/40">
                {card.icon}
              </div>
            </div>

            <div className="my-2">
              <span className="text-xl font-black text-head leading-none">{card.value}</span>
            </div>

            <div className="flex items-end justify-between mt-auto">
              <span className={`text-[9px] font-bold flex items-center gap-0.5 ${
                card.positive ? 'text-ok' : 'text-alert'
              }`}>
                {card.positive ? '▲' : '▼'} {card.change}
              </span>
              
              {/* Mini Trend Sparkline */}
              <svg width="45" height="15" className="opacity-80">
                <path
                  d={drawSparkline(card.trend)}
                  fill="none"
                  stroke={card.positive ? "var(--color-ok)" : "var(--color-alert)"}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </Card>
        ))}
      </div>

      {/* Main Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Hiring Pipeline Stage Table */}
        <Card variant="glass" className="p-6 lg:col-span-3 border border-line">
          <div className="flex items-center justify-between mb-5 border-b border-line pb-3.5">
            <div>
              <h3 className="text-sm font-bold text-head uppercase tracking-wider">Hiring Pipeline</h3>
              <p className="text-[10px] text-muted">Active stages and throughput by job role</p>
            </div>
            <Link to="/recruiter/jobs">
              <Button size="sm" variant="outline" className="text-xs">
                Manage Jobs
              </Button>
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-line text-muted uppercase font-bold tracking-wider text-[9px]">
                  <th className="py-3 pr-4">Job</th>
                  <th className="py-3 px-2 text-center">Applied</th>
                  <th className="py-3 px-2 text-center">AI Screening</th>
                  <th className="py-3 px-2 text-center">HR Review</th>
                  <th className="py-3 px-2 text-center">Tech Interview</th>
                  <th className="py-3 px-2 text-center">Final Interview</th>
                  <th className="py-3 px-2 text-center">Offer</th>
                  <th className="py-3 px-2 text-center">Hired</th>
                  <th className="py-3 px-2 text-center">Rejected</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                {pipelineRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-panel-2/25 transition-colors">
                    <td className="py-4 pr-4">
                      <div className="font-bold text-head">{row.position}</div>
                      <div className="text-[10px] text-muted font-medium mt-0.5">Total Applications: {row.total}</div>
                    </td>
                    
                    {/* Stage cells with progress pill indicators (Jet Black / Teal / Pale Sky theme) */}
                    <td className="py-4 px-2 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-6.5 rounded-lg font-bold bg-panel-2 text-text border border-line">
                        {row.applied}
                      </span>
                    </td>
                    <td className="py-4 px-2 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-6.5 rounded-lg font-bold bg-m1/40 text-text border border-m1">
                        {row.aiScreening}
                      </span>
                    </td>
                    <td className="py-4 px-2 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-6.5 rounded-lg font-bold bg-m1/70 text-text border border-m1">
                        {row.hrReview}
                      </span>
                    </td>
                    <td className="py-4 px-2 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-6.5 rounded-lg font-bold bg-m2/10 text-m2 border border-m2/25">
                        {row.techInterview}
                      </span>
                    </td>
                    <td className="py-4 px-2 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-6.5 rounded-lg font-bold bg-m2/15 text-m2 border border-m2/30">
                        {row.finalInterview}
                      </span>
                    </td>
                    <td className="py-4 px-2 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-6.5 rounded-lg font-bold bg-m2/20 text-m2 border border-m2/35">
                        {row.offer}
                      </span>
                    </td>
                    <td className="py-4 px-2 text-center">
                      <span className={`inline-flex items-center justify-center w-8 h-6.5 rounded-lg font-bold ${
                        row.hired > 0 
                          ? 'bg-m2 text-white shadow-sm shadow-m2/15' 
                          : 'bg-panel-2 text-muted border border-line'
                      }`}>
                        {row.hired}
                      </span>
                    </td>
                    <td className="py-4 px-2 text-center">
                      <span className={`inline-flex items-center justify-center w-8 h-6.5 rounded-lg font-bold ${
                        row.rejected > 0
                          ? 'bg-alert/10 text-alert border border-alert/20'
                          : 'bg-panel-2 text-muted border border-line'
                      }`}>
                        {row.rejected}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Analytics Section */}
        {/* Recruitment Funnel Card */}
        <Card variant="glass" className="p-6 border border-line flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-head uppercase tracking-wider mb-1">Recruitment Funnel</h3>
            <p className="text-[10px] text-muted mb-4">Stage-by-stage candidate retention rate</p>
          </div>

          <div className="space-y-3.5 my-auto">
            {/* Custom SVG/HTML Funnel bars */}
            {[
              { stage: 'Applied', count: 100, pct: 100, color: 'bg-m2' },
              { stage: 'Screening', count: 70, pct: 70, color: 'bg-m3' },
              { stage: 'Shortlisted', count: 40, pct: 40, color: 'bg-m4' },
              { stage: 'Interviewed', count: 20, pct: 20, color: 'bg-m5' },
              { stage: 'Hired', count: 8, pct: 8, color: 'bg-ok' },
            ].map((f, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold">
                  <span className="text-head">{f.stage}</span>
                  <span className="text-muted">{f.count} ({f.pct}%)</span>
                </div>
                <div className="w-full h-5 bg-line/45 rounded-xl overflow-hidden relative">
                  <div
                    className={`h-full rounded-xl transition-all duration-500 opacity-80 ${f.color}`}
                    style={{ width: `${f.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Applicants by Source */}
        <Card variant="glass" className="p-6 border border-line flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-head uppercase tracking-wider mb-1">Applicants by Source</h3>
            <p className="text-[10px] text-muted mb-4">Top channels generating candidates</p>
          </div>

          <div className="space-y-4 my-auto">
            {[
              { source: 'LinkedIn', count: 184, color: 'stroke-m2', pct: 60 },
              { source: 'Careers Portal', count: 96, color: 'stroke-m3', pct: 30 },
              { source: 'Referrals', count: 32, color: 'stroke-ok', pct: 10 },
            ].map((src, i) => (
              <div key={i} className="flex items-center gap-3">
                {/* Custom circular progress gauge */}
                <div className="relative w-10 h-10 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="20" cy="20" r="16" className="stroke-line" strokeWidth="3" fill="none" />
                    <circle
                      cx="20"
                      cy="20"
                      r="16"
                      strokeWidth="3"
                      fill="none"
                      className={src.color}
                      strokeDasharray={2 * Math.PI * 16}
                      strokeDashoffset={2 * Math.PI * 16 * (1 - src.pct / 100)}
                    />
                  </svg>
                  <span className="absolute text-[8px] font-bold text-head">{src.pct}%</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-head truncate">{src.source}</h4>
                  <p className="text-[10px] text-muted">{src.count} applicants</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Hiring by Department & Trend */}
        <Card variant="glass" className="p-6 border border-line flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-head uppercase tracking-wider mb-1">Hiring by Department</h3>
            <p className="text-[10px] text-muted mb-4">Throughput by corporate divisions</p>
          </div>

          <div className="space-y-3.5 my-auto">
            {[
              { dept: 'Engineering', count: 18, color: 'bg-m2', max: 20 },
              { dept: 'Product & UX', count: 12, color: 'bg-m3', max: 20 },
              { dept: 'Sales & Marketing', count: 8, color: 'bg-m4', max: 20 },
              { dept: 'Operations', count: 4, color: 'bg-m5', max: 20 },
            ].map((d, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold">
                  <span className="text-head truncate">{d.dept}</span>
                  <span className="text-muted">{d.count} Hires</span>
                </div>
                <div className="w-full h-2 bg-line/45 rounded-xl overflow-hidden">
                  <div
                    className={`h-full rounded-xl transition-all duration-300 ${d.color}`}
                    style={{ width: `${(d.count / d.max) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

export default DashboardPage
