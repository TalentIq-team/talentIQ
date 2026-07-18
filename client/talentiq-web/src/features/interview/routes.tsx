import type { RouteObject } from 'react-router-dom'
import { RoleGuard } from '@/app/guards/RoleGuard'
import ShortlistReviewPage from './pages/ShortlistReviewPage'
import EvaluationFormPage from './pages/EvaluationFormPage'

const shortlist = (
  <RoleGuard allowedRoles={['HiringManager']}>
    <ShortlistReviewPage />
  </RoleGuard>
)

const evaluation = (
  <RoleGuard allowedRoles={['HiringManager']}>
    <EvaluationFormPage />
  </RoleGuard>
)

export const interviewRoutes: RouteObject[] = [
  // Task-defined paths.
  { path: 'interview/shortlist', element: shortlist },
  { path: 'interview/evaluation/:id', element: evaluation },
  // Paths used by the shared Sidebar navigation (kept working).
  { path: 'hiring-manager/shortlist', element: shortlist },
  { path: 'hiring-manager/evaluations', element: evaluation },
  { path: 'hiring-manager/evaluations/:id', element: evaluation },
]
export default interviewRoutes
