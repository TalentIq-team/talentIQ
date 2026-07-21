import { createBrowserRouter, Navigate } from 'react-router-dom'
import AppLayout from '@/app/layout/AppLayout'
import DashboardPage from '@/features/admin/pages/DashboardPage'
import LandingPage from '@/features/landing/pages/LandingPage'
import authRoutes from '@/features/auth/routes'
import candidateRoutes from '@/features/candidate/routes'
import recruitmentRoutes from '@/features/recruitment/routes'
import interviewRoutes from '@/features/interview/routes'
import adminRoutes from '@/features/admin/routes'
import analyticsRoutes from '@/features/analytics/routes'
import talentPoolRoutes from '@/features/talent-pool/routes'
import { RoleGuard } from '@/app/guards/RoleGuard'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    element: (
      <RoleGuard>
        <AppLayout />
      </RoleGuard>
    ),
    children: [
      { path: 'dashboard', element: <DashboardPage /> },
      ...candidateRoutes,
      ...recruitmentRoutes,
      ...interviewRoutes,
      ...adminRoutes,
      ...analyticsRoutes,
      ...talentPoolRoutes,
    ],
  },
  ...authRoutes,
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])

export default router

