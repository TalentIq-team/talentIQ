import type { RouteObject } from 'react-router-dom'
import './interview.css'
import { RoleGuard } from '@/app/guards/RoleGuard'
import ShortlistReviewPage from './pages/ShortlistReviewPage'
import EvaluationFormPage from './pages/EvaluationFormPage'
import HiringManagerSettingsPage from './pages/HiringManagerSettingsPage'

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
    path: 'hiring-manager/settings',
    element: (
      <RoleGuard allowedRoles={['HiringManager', 'Recruiter', 'Admin']}>
        <HiringManagerSettingsPage />
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
