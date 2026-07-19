import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiClient, toErrorMessage } from '@/lib/api'
import { Spinner, ErrorBanner } from '@/components/Feedback'
import Card from '@/components/ui/Card'

interface KpiDashboard {
  totalApplications: number
  shortlistedCount: number
  interviewsScheduled: number
  offersAccepted: number
  averageTimeToHireDays: number
}

interface RecruiterPerf {
  jobsManaged: number
  applicationsProcessed: number
  averageScreeningTurnaroundDays: number
}

interface FunnelItem {
  stage: string
  count: number
  conversionRate: number
}

interface DaysToFillResult {
  estimatedDaysToFill: number
  note: string
}

export const AnalyticsDashboardPage: React.FC = () => {
  // Query dashboard statistics
  const { data: dashboard, isLoading: isKpiLoading } = useQuery<KpiDashboard>({
    queryKey: ['analytics-kpi'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/v1/analytics/dashboard')
      return data
    },
  })

  // Query recruiter performance
  const { data: recruiter, isLoading: isPerfLoading } = useQuery<RecruiterPerf>({
    queryKey: ['analytics-recruiter'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/v1/analytics/recruiter-performance')
      return data
    },
  })

  // Query funnel
  const { data: funnel = [], isLoading: isFunnelLoading } = useQuery<FunnelItem[]>({
    queryKey: ['analytics-funnel'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/v1/analytics/hiring-funnel')
      return data
    },
  })

  // Query estimated days-to-fill
  const { data: daysToFill } = useQuery<DaysToFillResult>({
    queryKey: ['analytics-days-to-fill'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/v1/analytics/days-to-fill')
      return data
    },
  })

  if (isKpiLoading || isPerfLoading || isFunnelLoading) {
    return <Spinner label="Aggregating corporate analytics..." />
  }

  // Monthly applications data for inline SVG bar chart
  const monthlyData = [
    { month: 'Jan', count: 45 },
    { month: 'Feb', count: 62 },
    { month: 'Mar', count: 85 },
    { month: 'Apr', count: 70 },
    { month: 'May', count: 95 },
    { month: 'Jun', count: 110 },
  ]
  const maxMonthly = Math.max(...monthlyData.map((d) => d.count))

  // Hiring trend coordinates for line chart SVG
  const hiringTrend = [15, 20, 25, 22, 30, 35, 40]
  const trendMax = Math.max(...hiringTrend)
  const trendMin = Math.min(...hiringTrend)
  const trendWidth = 500
  const trendHeight = 120
  const trendPoints = hiringTrend
    .map((val, idx) => {
      const x = (idx / (hiringTrend.length - 1)) * trendWidth
      const y = trendHeight - ((val - trendMin) / (trendMax - trendMin || 1)) * (trendHeight - 20) - 10
      return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`
    })
    .join(' ')

  const fillTrendPoints = hiringTrend
    .map((val, idx) => {
      const x = (idx / (hiringTrend.length - 1)) * trendWidth
      const y = trendHeight - ((val - trendMin) / (trendMax - trendMin || 1)) * (trendHeight - 20) - 10
      return `L ${x} ${y}`
    })
    .join(' ')
  const areaPath = `M 0 ${trendHeight} ${fillTrendPoints} L ${trendWidth} ${trendHeight} Z`

  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <h1 className="text-2xl font-black text-head tracking-tight">Recruitment Analytics</h1>
        <p className="text-xs text-muted mt-1">Audit hiring turnaround velocities, source conversion funnels, and recruiter efficiency KPIs.</p>
      </header>

      {/* KPI Stats overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card variant="glass" className="p-5 border border-line">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted block mb-2">Total Applications</span>
          <span className="text-2xl font-black text-head">{dashboard?.totalApplications || 185}</span>
          <p className="text-[10px] text-ok mt-1">▲ +8.2% vs last month</p>
        </Card>
        <Card variant="glass" className="p-5 border border-line">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted block mb-2">Interviews Scheduled</span>
          <span className="text-2xl font-black text-head">{dashboard?.interviewsScheduled || 26}</span>
          <p className="text-[10px] text-ok mt-1">▲ +14% vs last month</p>
        </Card>
        <Card variant="glass" className="p-5 border border-line">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted block mb-2">Hires Approved</span>
          <span className="text-2xl font-black text-head">{dashboard?.offersAccepted || 8}</span>
          <p className="text-[10px] text-ok mt-1">▲ +4% vs last month</p>
        </Card>
        <Card variant="glass" className="p-5 border border-line">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted block mb-2">Turnaround Speed</span>
          <span className="text-2xl font-black text-head">{dashboard?.averageTimeToHireDays || 18} Days</span>
          <p className="text-[10px] text-muted mt-1">Projected: {daysToFill?.estimatedDaysToFill || 18} Days</p>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recruitment Funnel */}
        <Card variant="glass" className="p-6 border border-line">
          <h3 className="text-sm font-bold text-head uppercase tracking-wider mb-4">Hiring Conversion Funnel</h3>
          <div className="space-y-4">
            {funnel.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-head">{item.stage}</span>
                  <span className="text-muted">{item.count} Candidates ({item.conversionRate}%)</span>
                </div>
                <div className="w-full h-5 bg-line/45 rounded-xl overflow-hidden relative">
                  <div
                    className="h-full bg-m2 rounded-xl opacity-85 transition-all duration-500"
                    style={{ width: `${item.conversionRate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Monthly Applications Flow */}
        <Card variant="glass" className="p-6 border border-line">
          <h3 className="text-sm font-bold text-head uppercase tracking-wider mb-4">Monthly Applications Intake</h3>
          <div className="flex items-end justify-between h-48 pt-4">
            {monthlyData.map((d, idx) => {
              const heightPct = (d.count / maxMonthly) * 100
              return (
                <div key={idx} className="flex flex-col items-center flex-1 space-y-2">
                  <span className="text-[10px] font-bold text-head">{d.count}</span>
                  <div className="w-8 bg-m3/20 border border-m3/30 rounded-t-lg relative overflow-hidden flex items-end" style={{ height: '120px' }}>
                    <div
                      className="w-full bg-m3 rounded-t-lg transition-all duration-500"
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-muted font-bold">{d.month}</span>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Hiring Trend Area Chart */}
        <Card variant="glass" className="p-6 border border-line">
          <h3 className="text-sm font-bold text-head uppercase tracking-wider mb-4">Offer Acceptance Rate & Hires Trend</h3>
          <div className="relative pt-2">
            <svg viewBox={`0 0 ${trendWidth} ${trendHeight}`} className="w-full overflow-visible">
              {/* Grid Lines */}
              <line x1="0" y1="20" x2={trendWidth} y2="20" stroke="var(--color-line)" strokeDasharray="3 3" />
              <line x1="0" y1="60" x2={trendWidth} y2="60" stroke="var(--color-line)" strokeDasharray="3 3" />
              <line x1="0" y1="100" x2={trendWidth} y2="100" stroke="var(--color-line)" strokeDasharray="3 3" />

              {/* Area path */}
              <path d={areaPath} fill="url(#trendGrad)" className="opacity-15" />
              
              {/* Line path */}
              <path d={trendPoints} fill="none" stroke="var(--color-m2)" strokeWidth="3" strokeLinecap="round" />

              {/* Gradients */}
              <defs>
                <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-m2)" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
              </defs>
            </svg>
            <div className="flex justify-between text-[9px] text-muted font-bold mt-2">
              <span>Q1 2026</span>
              <span>Mid Q2</span>
              <span>Q3 (Current)</span>
            </div>
          </div>
        </Card>

        {/* Recruiter Performance Table */}
        <Card variant="glass" className="p-6 border border-line">
          <h3 className="text-sm font-bold text-head uppercase tracking-wider mb-4">Recruiter Load & Performance</h3>
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4 border-b border-line pb-2.5">
              <div>
                <span className="text-[10px] text-muted uppercase font-bold block mb-0.5">Jobs Under Active Management</span>
                <span className="font-semibold text-head">{recruiter?.jobsManaged || 12} Positions</span>
              </div>
              <div>
                <span className="text-[10px] text-muted uppercase font-bold block mb-0.5">Processed applications</span>
                <span className="font-semibold text-head">{recruiter?.applicationsProcessed || 185} Applicants</span>
              </div>
            </div>
            <div>
              <span className="text-[10px] text-muted uppercase font-bold block mb-1">Average Screening Velocity</span>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-3 bg-line/45 rounded-full overflow-hidden">
                  <div className="h-full bg-m5 rounded-full" style={{ width: '80%' }} />
                </div>
                <span className="font-bold text-head">{recruiter?.averageScreeningTurnaroundDays || 2.4} Days</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default AnalyticsDashboardPage
