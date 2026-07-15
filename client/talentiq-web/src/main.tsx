import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createBrowserRouter, Navigate } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import ProfilePage from './routes/candidate/ProfilePage.tsx'
import JobSearchPage from './routes/candidate/JobSearchPage.tsx'
import ApplicationTrackerPage from './routes/candidate/ApplicationTrackerPage.tsx'
import JobPostingsPage from './routes/recruiter/JobPostingsPage.tsx'
import CandidatePipelinePage from './routes/recruiter/CandidatePipelinePage.tsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
})

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Navigate to="/candidate/jobs" replace /> },
      { path: 'candidate/profile', element: <ProfilePage /> },
      { path: 'candidate/jobs', element: <JobSearchPage /> },
      { path: 'candidate/applications', element: <ApplicationTrackerPage /> },
      { path: 'recruiter/jobs', element: <JobPostingsPage /> },
      { path: 'recruiter/jobs/:jobId/pipeline', element: <CandidatePipelinePage /> },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
)
