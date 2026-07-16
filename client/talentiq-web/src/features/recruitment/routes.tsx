import type { RouteObject } from 'react-router-dom'
import JobPostingsPage from './pages/JobPostingsPage'
import CandidatePipelinePage from './pages/CandidatePipelinePage'
import { RoleGuard } from '@/app/guards/RoleGuard'

// Stub for M6 Talent Pool dashboard
const TalentPoolDashboardStub = () => (
  <div className="space-y-6">
    <header>
      <h1 className="text-2xl font-bold">Talent Pool Dashboard</h1>
      <p className="text-sm text-muted">Manage, filter, and re-engage pooled candidates based on skill improvement.</p>
    </header>
    <div className="rounded-2xl border border-line bg-panel p-8 text-center text-muted">
      This dashboard is owned by Member 6 (yathushi) and will be implemented in Phase 1.
    </div>
  </div>
)

export const recruitmentRoutes: RouteObject[] = [
  {
    path: 'recruiter/jobs',
    element: (
      <RoleGuard allowedRoles={['Recruiter']}>
        <JobPostingsPage />
      </RoleGuard>
    ),
  },
  {
    path: 'recruiter/jobs/:jobId/pipeline',
    element: (
      <RoleGuard allowedRoles={['Recruiter']}>
        <CandidatePipelinePage />
      </RoleGuard>
    ),
  },
  {
    path: 'recruiter/talent-pool',
    element: (
      <RoleGuard allowedRoles={['Recruiter']}>
        <TalentPoolDashboardStub />
      </RoleGuard>
    ),
  },
]
export default recruitmentRoutes
