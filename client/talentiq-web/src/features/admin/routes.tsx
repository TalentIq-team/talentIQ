import { RouteObject } from 'react-router-dom'
import { RoleGuard } from '@/app/guards/RoleGuard'

const UserManagementStub = () => (
  <div className="space-y-6">
    <header>
      <h1 className="text-2xl font-bold">User Management</h1>
      <p className="text-sm text-muted">Manage system users, department mappings, and authentication roles.</p>
    </header>
    <div className="rounded-2xl border border-line bg-panel p-8 text-center text-muted">
      This page is owned by Member 2 (Tharindu) and will be implemented in Phase 1.
    </div>
  </div>
)

const OrgDeptStub = () => (
  <div className="space-y-6">
    <header>
      <h1 className="text-2xl font-bold">Organization & Departments</h1>
      <p className="text-sm text-muted">Manage organization metadata, structures, and department configurations.</p>
    </header>
    <div className="rounded-2xl border border-line bg-panel p-8 text-center text-muted">
      This page is owned by Member 2 (Tharindu) and will be implemented in Phase 1.
    </div>
  </div>
)

const KpiAnalyticsStub = () => (
  <div className="space-y-6">
    <header>
      <h1 className="text-2xl font-bold">KPI Dashboard</h1>
      <p className="text-sm text-muted">Monitor organization-wide recruitment funnel statistics and average fill velocity.</p>
    </header>
    <div className="rounded-2xl border border-line bg-panel p-8 text-center text-muted">
      This page is owned by Member 6 (yathushi) and will be implemented in Phase 1.
    </div>
  </div>
)

export const adminRoutes: RouteObject[] = [
  {
    path: 'admin/users',
    element: (
      <RoleGuard allowedRoles={['Admin']}>
        <UserManagementStub />
      </RoleGuard>
    ),
  },
  {
    path: 'admin/organization',
    element: (
      <RoleGuard allowedRoles={['Admin']}>
        <OrgDeptStub />
      </RoleGuard>
    ),
  },
  {
    path: 'admin/analytics',
    element: (
      <RoleGuard allowedRoles={['Admin']}>
        <KpiAnalyticsStub />
      </RoleGuard>
    ),
  },
]
export default adminRoutes
