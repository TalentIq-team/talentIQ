import type { RouteObject } from 'react-router-dom'
import { RoleGuard } from '@/app/guards/RoleGuard'
import UserManagementPage from './pages/UserManagementPage'
import OrgDeptPage from './pages/OrgDeptPage'
import AnalyticsDashboardPage from '@/features/analytics/pages/AnalyticsDashboardPage'

export const adminRoutes: RouteObject[] = [
  {
    path: 'admin/users',
    element: (
      <RoleGuard allowedRoles={['Admin', 'Recruiter']}>
        <UserManagementPage />
      </RoleGuard>
    ),
  },
  {
    path: 'admin/organization',
    element: (
      <RoleGuard allowedRoles={['Admin']}>
        <OrgDeptPage />
      </RoleGuard>
    ),
  },
  {
    path: 'admin/analytics',
    element: (
      <RoleGuard allowedRoles={['Admin', 'Recruiter', 'HiringManager']}>
        <AnalyticsDashboardPage />
      </RoleGuard>
    ),
  },
]
export default adminRoutes
