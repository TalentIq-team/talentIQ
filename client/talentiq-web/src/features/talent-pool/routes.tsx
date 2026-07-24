import type { RouteObject } from 'react-router-dom'
import { RoleGuard } from '@/app/guards/RoleGuard'
import TalentPoolConsentPage from './pages/TalentPoolConsentPage'
import TalentPoolDashboardPage from './pages/TalentPoolDashboardPage'

export const talentPoolRoutes: RouteObject[] = [
  {
    path: 'candidate/talent-pool',
    element: (
      <RoleGuard allowedRoles={['Candidate', 'Admin']}>
        <TalentPoolConsentPage />
      </RoleGuard>
    ),
  },
  {
    path: 'recruiter/talent-pool',
    element: (
      <RoleGuard allowedRoles={['Recruiter', 'HiringManager', 'Admin']}>
        <TalentPoolDashboardPage />
      </RoleGuard>
    ),
  },
  {
    path: 'hiring-manager/talent-pool',
    element: (
      <RoleGuard allowedRoles={['HiringManager', 'Recruiter', 'Admin']}>
        <TalentPoolDashboardPage />
      </RoleGuard>
    ),
  },
]

export default talentPoolRoutes
