import type { RouteObject } from 'react-router-dom'
import { RoleGuard } from '@/app/guards/RoleGuard'
import UserManagementPage from './pages/UserManagementPage'
import OrgDeptPage from './pages/OrgDeptPage'
import AnalyticsDashboardPage from '@/features/analytics/pages/AnalyticsDashboardPage'
import AdminSettingsPage from './pages/AdminSettingsPage'
import AuditLogsPage from './pages/AuditLogsPage'

export const adminRoutes: RouteObject[] = [
  {
    path: 'admin/users',
    element: (
      <RoleGuard allowedRoles={['Admin']}>
        <UserManagementPage />
      </RoleGuard>
    ),
  },
  {
    path: 'admin/settings',
    element: (
      <RoleGuard allowedRoles={['Admin']}>
        <AdminSettingsPage />
      </RoleGuard>
    ),
  },
  {
    path: 'admin/audit-logs',
    element: (
      <RoleGuard allowedRoles={['Admin']}>
        <AuditLogsPage />
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
