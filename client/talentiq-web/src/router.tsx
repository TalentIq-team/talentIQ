import { createBrowserRouter, Navigate } from 'react-router-dom'
import AppLayout from '@/app/layout/AppLayout'
import LandingPage from '@/features/landing/pages/LandingPage'
import authRoutes from '@/features/auth/routes'
import candidateRoutes from '@/features/candidate/routes'
import recruitmentRoutes from '@/features/recruitment/routes'
import interviewRoutes from '@/features/interview/routes'
import adminRoutes from '@/features/admin/routes'
import analyticsRoutes from '@/features/analytics/routes'
import talentPoolRoutes from '@/features/talent-pool/routes'
import { RoleGuard } from '@/app/guards/RoleGuard'
import { useAuth } from '@/hooks/useAuth'

const RoleBasedRedirect = () => {
  const { user } = useAuth()
  if (user?.role === 'Candidate') return <Navigate to="/candidate/jobs" replace />
  if (user?.role === 'Recruiter') return <Navigate to="/recruiter/jobs" replace />
  if (user?.role === 'HiringManager') return <Navigate to="/hiring-manager/shortlist" replace />
  if (user?.role === 'Admin') return <Navigate to="/recruiter/jobs" replace />
  return <Navigate to="/candidate/jobs" replace />
}

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
      { index: true, element: <RoleBasedRedirect /> },
      { path: 'dashboard', element: <RoleBasedRedirect /> },
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


