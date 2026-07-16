import { createBrowserRouter, Navigate } from 'react-router-dom'
import AppLayout from '@/app/layout/AppLayout'
import authRoutes from '@/features/auth/routes'
import candidateRoutes from '@/features/candidate/routes'
import recruitmentRoutes from '@/features/recruitment/routes'
import interviewRoutes from '@/features/interview/routes'
import adminRoutes from '@/features/admin/routes'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/candidate/jobs" replace /> },
      ...candidateRoutes,
      ...recruitmentRoutes,
      ...interviewRoutes,
      ...adminRoutes,
    ],
  },
  ...authRoutes,
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
])

export default router
