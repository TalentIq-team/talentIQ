import type { RouteObject } from 'react-router-dom'
import ProfilePage from './pages/ProfilePage'
import JobSearchPage from './pages/JobSearchPage'
import ApplicationTrackerPage from './pages/ApplicationTrackerPage'
import TalentPoolConsentPage from '../talent-pool/pages/TalentPoolConsentPage'
import CandidateSettingsPage from './pages/CandidateSettingsPage'
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
    path: 'candidate/settings',
    element: (
      <RoleGuard allowedRoles={['Candidate', 'Admin']}>
        <CandidateSettingsPage />
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
