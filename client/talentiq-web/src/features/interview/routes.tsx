import type { RouteObject } from 'react-router-dom'
import { RoleGuard } from '@/app/guards/RoleGuard'

const ShortlistReviewStub = () => (
  <div className="space-y-6">
    <header>
      <h1 className="text-2xl font-bold">Shortlist Review</h1>
      <p className="text-sm text-muted">Review shortlisted candidate profiles and details.</p>
    </header>
    <div className="rounded-2xl border border-line bg-panel p-8 text-center text-muted">
      This page is owned by Member 4 (Thilina) and will be implemented in Phase 1.
    </div>
  </div>
)

const EvaluationScorecardStub = () => (
  <div className="space-y-6">
    <header>
      <h1 className="text-2xl font-bold">Evaluations Scorecard</h1>
      <p className="text-sm text-muted">Submit and manage scores and hiring recommendations.</p>
    </header>
    <div className="rounded-2xl border border-line bg-panel p-8 text-center text-muted">
      This page is owned by Member 4 (Thilina) and will be implemented in Phase 1.
    </div>
  </div>
)

export const interviewRoutes: RouteObject[] = [
  {
    path: 'hiring-manager/shortlist',
    element: (
      <RoleGuard allowedRoles={['HiringManager']}>
        <ShortlistReviewStub />
      </RoleGuard>
    ),
  },
  {
    path: 'hiring-manager/evaluations',
    element: (
      <RoleGuard allowedRoles={['HiringManager']}>
        <EvaluationScorecardStub />
      </RoleGuard>
    ),
  },
]
export default interviewRoutes
