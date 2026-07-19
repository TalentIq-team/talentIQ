import type { RouteObject } from 'react-router-dom'
import { RoleGuard } from '@/app/guards/RoleGuard'
import ShortlistReviewPage from './pages/ShortlistReviewPage'
import EvaluationFormPage from './pages/EvaluationFormPage'

export const interviewRoutes: RouteObject[] = [
  {
    path: 'hiring-manager/shortlist',
    element: (
      <RoleGuard allowedRoles={['HiringManager', 'Recruiter', 'Admin']}>
        <ShortlistReviewPage />
      </RoleGuard>
    ),
  },
  {
    path: 'hiring-manager/evaluations',
    element: (
      <RoleGuard allowedRoles={['HiringManager', 'Recruiter', 'Admin']}>
        <EvaluationFormPage />
      </RoleGuard>
    ),
  },
]
export default interviewRoutes
