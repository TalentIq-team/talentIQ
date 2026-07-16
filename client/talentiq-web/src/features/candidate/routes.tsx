import { RouteObject } from 'react-router-dom'
import ProfilePage from './pages/ProfilePage'
import JobSearchPage from './pages/JobSearchPage'
import ApplicationTrackerPage from './pages/ApplicationTrackerPage'
import { RoleGuard } from '@/app/guards/RoleGuard'

// Stub for M6 Talent Pool page to keep nav compilation active
const TalentPoolConsentStub = () => (
  <div className="space-y-6">
    <header>
      <h1 className="text-2xl font-bold">Talent Pool Consent</h1>
      <p className="text-sm text-muted">Review, accept, or withdraw your talent pool inclusion consent.</p>
    </header>
    <div className="rounded-2xl border border-line bg-panel p-8 text-center text-muted">
      This page is owned by Member 6 (yathushi) and will be implemented in Phase 1.
    </div>
  </div>
)

export const candidateRoutes: RouteObject[] = [
  {
    path: 'candidate/profile',
    element: (
      <RoleGuard allowedRoles={['Candidate']}>
        <ProfilePage />
      </RoleGuard>
    ),
  },
  {
    path: 'candidate/jobs',
    element: (
      <RoleGuard allowedRoles={['Candidate']}>
        <JobSearchPage />
      </RoleGuard>
    ),
  },
  {
    path: 'candidate/applications',
    element: (
      <RoleGuard allowedRoles={['Candidate']}>
        <ApplicationTrackerPage />
      </RoleGuard>
    ),
  },
  {
    path: 'candidate/talent-pool',
    element: (
      <RoleGuard allowedRoles={['Candidate']}>
        <TalentPoolConsentStub />
      </RoleGuard>
    ),
  },
]
export default candidateRoutes
