import type { RouteObject } from 'react-router-dom'
import { RoleGuard } from '@/app/guards/RoleGuard'
import TalentPoolConsentPage from './pages/TalentPoolConsentPage'
import TalentPoolDashboardPage from './pages/TalentPoolDashboardPage'

export const talentPoolRoutes: RouteObject[] = [
  {
    path: 'candidate/talent-pool',
    element: (
      <RoleGuard allowedRoles={['Candidate']}>
        <TalentPoolConsentPage />
      </RoleGuard>
    ),
  },
  {
    path: 'recruiter/talent-pool',
    element: (
      <RoleGuard allowedRoles={['Recruiter']}>
        <TalentPoolDashboardPage />
      </RoleGuard>
    ),
  },
]

export default talentPoolRoutes
