import type { RouteObject } from 'react-router-dom'
import { RoleGuard } from '@/app/guards/RoleGuard'
import AnalyticsDashboardPage from './pages/AnalyticsDashboardPage'

export const analyticsRoutes: RouteObject[] = [
  {
    path: 'admin/analytics',
    element: (
      <RoleGuard allowedRoles={['Admin']}>
        <AnalyticsDashboardPage />
      </RoleGuard>
    ),
  },
]

export default analyticsRoutes
