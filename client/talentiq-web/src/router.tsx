import { createBrowserRouter, Navigate } from 'react-router-dom'
import AppLayout from '@/app/layout/AppLayout'
import DashboardPage from '@/features/admin/pages/DashboardPage'
import authRoutes from '@/features/auth/routes'
import candidateRoutes from '@/features/candidate/routes'
import recruitmentRoutes from '@/features/recruitment/routes'
import interviewRoutes from '@/features/interview/routes'
import adminRoutes from '@/features/admin/routes'
import analyticsRoutes from '@/features/analytics/routes'
import talentPoolRoutes from '@/features/talent-pool/routes'
import { RoleGuard } from '@/app/guards/RoleGuard'

import TestAiPanelsPage from '@/features/ai/pages/TestAiPanelsPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <RoleGuard>
        <AppLayout />
      </RoleGuard>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
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
    path: '/test-ai-panels',
    element: <TestAiPanelsPage />,
  },
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
])

export default router
