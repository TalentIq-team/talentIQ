import type { RouteObject } from 'react-router-dom'
import JobPostingsPage from './pages/JobPostingsPage'
import CandidatePipelinePage from './pages/CandidatePipelinePage'
import RecruiterSettingsPage from './pages/RecruiterSettingsPage'
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
    path: 'recruiter/settings',
    element: (
      <RoleGuard allowedRoles={['Recruiter', 'Admin']}>
        <RecruiterSettingsPage />
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
