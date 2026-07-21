import type { RouteObject } from 'react-router-dom'
import JobPostingsPage from './pages/JobPostingsPage'
import CandidatePipelinePage from './pages/CandidatePipelinePage'
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
]
export default recruitmentRoutes
