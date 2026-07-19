import type { RouteObject } from 'react-router-dom'
import JobPostingsPage from './pages/JobPostingsPage'
import CandidatePipelinePage from './pages/CandidatePipelinePage'
import TalentPoolDashboardPage from '../talent-pool/pages/TalentPoolDashboardPage'
import { RoleGuard } from '@/app/guards/RoleGuard'

export const recruitmentRoutes: RouteObject[] = [
  {
    path: 'recruiter/jobs',
    element: (
      <RoleGuard allowedRoles={['Recruiter', 'Admin']}>
        <JobPostingsPage />
      </RoleGuard>
    ),
  },
  {
    path: 'recruiter/jobs/:jobId/pipeline',
    element: (
      <RoleGuard allowedRoles={['Recruiter', 'Admin']}>
        <CandidatePipelinePage />
      </RoleGuard>
    ),
  },
  {
    path: 'recruiter/talent-pool',
    element: (
      <RoleGuard allowedRoles={['Recruiter', 'Admin']}>
        <TalentPoolDashboardPage />
      </RoleGuard>
    ),
  },
]
export default recruitmentRoutes
