import React, { useState } from 'react'
import { LandingNavbar } from '../components/LandingNavbar'
import { LandingHero } from '../components/LandingHero'
import { JobShowcase } from '../components/JobShowcase'
import { JobDetailModal } from '../components/JobDetailModal'
import { LoginRequiredModal } from '../components/LoginRequiredModal'
import { AIFeaturesShowcase } from '../components/AIFeaturesShowcase'
import { PlatformStats } from '../components/PlatformStats'
import { LandingFooter } from '../components/LandingFooter'
import type { JobPosting } from '@/api/types'
import { useAuth } from '@/hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { submitApplication, getCandidateProfile } from '@/api/endpoints'

export const LandingPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [detailJob, setDetailJob] = useState<JobPosting | null>(null)
  const [loginPromptJob, setLoginPromptJob] = useState<JobPosting | null>(null)
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [applySuccessMsg, setApplySuccessMsg] = useState<string | null>(null)

  const handleApplyJob = async (job: JobPosting) => {
    // If not authenticated, prompt login/register modal
    if (!isAuthenticated || !user) {
      setDetailJob(null)
      setLoginPromptJob(job)
      return
    }

    // If user is a Candidate, process or navigate to candidate dashboard application
    if (user.role === 'Candidate') {
      try {
        setSubmitting(true)
        // Attempt to submit using candidate profile or navigate to candidate application view
        navigate(`/candidate/jobs/${job.id}`)
      } catch {
        setDetailJob(null)
        setLoginPromptJob(job)
      } finally {
        setSubmitting(false)
      }
    } else {
      // If user is Recruiter or Admin, navigate to recruiter pipeline
      navigate(`/dashboard`)
    }
  }

  return (
    <div className="min-h-screen bg-ink text-text font-sans selection:bg-accent-subtle selection:text-accent">
      {/* Top Navigation */}
      <LandingNavbar />

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <LandingHero />

        {/* Live Job Openings & Showcase */}
        <JobShowcase
          onSelectJob={(job) => setDetailJob(job)}
          onApplyJob={(job) => handleApplyJob(job)}
        />

        {/* Gemini AI Engine Showcase & Live Simulator */}
        <AIFeaturesShowcase />

        {/* Enterprise Platform Stats & Portals */}
        <PlatformStats />
      </main>

      {/* Footer */}
      <LandingFooter />

      {/* Job Detail Modal */}
      <JobDetailModal
        job={detailJob}
        onClose={() => setDetailJob(null)}
        onApply={(job) => handleApplyJob(job)}
      />

      {/* Login Required Modal */}
      <LoginRequiredModal
        job={loginPromptJob}
        onClose={() => setLoginPromptJob(null)}
      />
    </div>
  )
}
export default LandingPage
