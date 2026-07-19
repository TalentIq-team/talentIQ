import type { RouteObject } from 'react-router-dom'
import ProfilePage from './pages/ProfilePage'
import JobSearchPage from './pages/JobSearchPage'
import ApplicationTrackerPage from './pages/ApplicationTrackerPage'
import TalentPoolConsentPage from '../talent-pool/pages/TalentPoolConsentPage'
import { RoleGuard } from '@/app/guards/RoleGuard'

export const candidateRoutes: RouteObject[] = [
  {
    path: 'candidate/profile',
    element: (
      <RoleGuard allowedRoles={['Candidate', 'Admin']}>
        <ProfilePage />
      </RoleGuard>
    ),
  },
  {
    path: 'candidate/jobs',
    element: (
      <RoleGuard allowedRoles={['Candidate', 'Admin']}>
        <JobSearchPage />
      </RoleGuard>
    ),
  },
  {
    path: 'candidate/applications',
    element: (
      <RoleGuard allowedRoles={['Candidate', 'Admin']}>
        <ApplicationTrackerPage />
      </RoleGuard>
    ),
  },
  {
    path: 'candidate/talent-pool',
    element: (
      <RoleGuard allowedRoles={['Candidate', 'Admin']}>
        <TalentPoolConsentPage />
      </RoleGuard>
    ),
  },
]
export default candidateRoutes
