import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createCandidateProfile,
  getCandidateProfile,
  updateCandidateProfile,
  uploadResume,
  addCandidateExperience,
  deleteCandidateExperience,
  addCandidateEducation,
  deleteCandidateEducation,
  addCandidateProject,
  deleteCandidateProject,
  addCandidateCertification,
  deleteCandidateCertification,
  addCandidateLanguage,
  deleteCandidateLanguage,
} from '@/api/endpoints'
import { toErrorMessage } from '@/lib/api'
import { getCandidateProfileId, setCandidateProfileId } from '@/api/session'
import { Spinner, ErrorBanner } from '@/components/Feedback'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import JobRecommendations from '@/features/ai/components/JobRecommendations'

// Enterprise Section Components
import ProfileHeaderCard from '../components/profile/ProfileHeaderCard'
import PersonalInfoSection from '../components/profile/PersonalInfoSection'
import ProfessionalInfoSection from '../components/profile/ProfessionalInfoSection'
import ExperienceSection from '../components/profile/ExperienceSection'
import EducationSection from '../components/profile/EducationSection'
import ProjectsSection from '../components/profile/ProjectsSection'
import CertificationsSection from '../components/profile/CertificationsSection'
import LanguagesSection from '../components/profile/LanguagesSection'
import SkillsSection from '../components/profile/SkillsSection'
import SocialLinksSection from '../components/profile/SocialLinksSection'
import JobPreferencesSection from '../components/profile/JobPreferencesSection'
import PrivacySettingsSection from '../components/profile/PrivacySettingsSection'
import ApplicationHistorySection from '../components/profile/ApplicationHistorySection'
import InterviewHistorySection from '../components/profile/InterviewHistorySection'
import AiProfileInsightsSection from '../components/profile/AiProfileInsightsSection'

export default function ProfilePage() {
  const queryClient = useQueryClient()

  const [profileId, setProfileId] = useState<string | null>(getCandidateProfileId())
  const [activeTab, setActiveTab] = useState<'overview' | 'experience' | 'skills' | 'credentials' | 'preferences' | 'history' | 'ai'>('overview')
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [banner, setBanner] = useState<string | null>(null)

  const profileQuery = useQuery({
    queryKey: ['candidate-profile', profileId],
    queryFn: () => getCandidateProfile(profileId!),
    enabled: Boolean(profileId),
  })

  // Root update mutation
  const saveMutation = useMutation({
    mutationFn: async (updatedData: any) => {
      if (profileId) {
        return updateCandidateProfile(profileId, {
          professionalSummary: updatedData.professionalSummary ?? profileQuery.data?.professionalSummary ?? 'Software Professional',
          yearsOfExperience: updatedData.yearsOfExperience ?? profileQuery.data?.yearsOfExperience ?? 1,
          ...updatedData,
        })
      }

      return createCandidateProfile({
        professionalSummary: updatedData.professionalSummary || 'Dedicated software candidate.',
        yearsOfExperience: updatedData.yearsOfExperience || 1,
        skillIds: [],
        ...updatedData,
      })
    },
    onSuccess: (profile) => {
      setProfileId(profile.id)
      setCandidateProfileId(profile.id)
      setBanner('Profile updated successfully.')
      queryClient.invalidateQueries({ queryKey: ['candidate-profile'] })
    },
    onError: (error) => setBanner(toErrorMessage(error)),
  })

  // Resume upload mutation
  const resumeMutation = useMutation({
    mutationFn: () => uploadResume(profileId!, resumeFile!),
    onSuccess: () => {
      setBanner('Resume uploaded successfully.')
      setResumeFile(null)
      queryClient.invalidateQueries({ queryKey: ['candidate-profile', profileId] })
    },
    onError: (error) => setBanner(toErrorMessage(error)),
  })

  // Section CRUD mutations
  const expMutation = useMutation({
    mutationFn: (data: any) => addCandidateExperience(profileId!, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['candidate-profile', profileId] }),
  })
  const deleteExpMutation = useMutation({
    mutationFn: (expId: string) => deleteCandidateExperience(profileId!, expId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['candidate-profile', profileId] }),
  })

  const eduMutation = useMutation({
    mutationFn: (data: any) => addCandidateEducation(profileId!, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['candidate-profile', profileId] }),
  })
  const deleteEduMutation = useMutation({
    mutationFn: (eduId: string) => deleteCandidateEducation(profileId!, eduId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['candidate-profile', profileId] }),
  })

  const projMutation = useMutation({
    mutationFn: (data: any) => addCandidateProject(profileId!, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['candidate-profile', profileId] }),
  })
  const deleteProjMutation = useMutation({
    mutationFn: (projId: string) => deleteCandidateProject(profileId!, projId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['candidate-profile', profileId] }),
  })

  const certMutation = useMutation({
    mutationFn: (data: any) => addCandidateCertification(profileId!, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['candidate-profile', profileId] }),
  })
  const deleteCertMutation = useMutation({
    mutationFn: (certId: string) => deleteCandidateCertification(profileId!, certId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['candidate-profile', profileId] }),
  })

  const langMutation = useMutation({
    mutationFn: (data: any) => addCandidateLanguage(profileId!, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['candidate-profile', profileId] }),
  })
  const deleteLangMutation = useMutation({
    mutationFn: (langId: string) => deleteCandidateLanguage(profileId!, langId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['candidate-profile', profileId] }),
  })

  const profile = profileQuery.data

  const tabs = [
    { id: 'overview', label: '👤 Overview & Contact', icon: '👤' },
    { id: 'experience', label: '💼 Experience & Education', icon: '💼' },
    { id: 'skills', label: '⚡ Skills & Projects', icon: '⚡' },
    { id: 'credentials', label: '📜 Certifications & Languages', icon: '📜' },
    { id: 'preferences', label: '⚙️ Preferences & Privacy', icon: '⚙️' },
    { id: 'history', label: '📑 Applications & Interviews', icon: '📑' },
    { id: 'ai', label: '✨ AI Diagnostics', icon: '✨' },
  ] as const

  return (
    <div className="space-y-6 animate-fade-in text-left max-w-6xl mx-auto pb-12">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight text-head">
          Enterprise Candidate Profile
        </h1>
        <p className="mt-1 text-xs text-muted">
          Manage your executive resume credentials, work history, skill taxonomy, and Gemini AI career insights.
        </p>
      </header>

      {banner && (
        <Card
          variant="borderless"
          className="rounded-xl border border-line bg-panel-2 p-3 text-xs font-semibold text-text flex items-center justify-between"
        >
          <span>{banner}</span>
          <button type="button" onClick={() => setBanner(null)} className="text-muted hover:text-head">✕</button>
        </Card>
      )}

      {profileQuery.isLoading && <Spinner label="Loading candidate profile suite…" />}
      {profileQuery.isError && <ErrorBanner message={toErrorMessage(profileQuery.error)} />}

      {/* Header Profile Card */}
      {profile && (
        <ProfileHeaderCard
          profile={profile}
          onAvatarUpload={(file) => saveMutation.mutate({ profilePictureUrl: URL.createObjectURL(file) })}
        />
      )}

      {/* Main Tabbed Profile Suite */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Navigation Sidebar */}
        <div className="md:col-span-1 space-y-1 bg-panel border border-line p-3 rounded-2xl h-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-accent/15 text-accent border border-accent/30 shadow-sm'
                  : 'text-muted hover:text-head hover:bg-panel-2/50'
              }`}
            >
              <span>{tab.label}</span>
              {activeTab === tab.id && <span className="text-accent">→</span>}
            </button>
          ))}
        </div>

        {/* Tab Content Panels */}
        <div className="md:col-span-3 space-y-6">
          {profile ? (
            <>
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <ProfessionalInfoSection
                    profile={profile}
                    onSave={(data) => saveMutation.mutate(data)}
                    isPending={saveMutation.isPending}
                  />
                  <PersonalInfoSection
                    profile={profile}
                    onSave={(data) => saveMutation.mutate(data)}
                    isPending={saveMutation.isPending}
                  />
                  <SocialLinksSection
                    profile={profile}
                    onSave={(data) => saveMutation.mutate(data)}
                    isPending={saveMutation.isPending}
                  />
                </div>
              )}

              {activeTab === 'experience' && (
                <div className="space-y-6">
                  <ExperienceSection
                    experiences={profile.experiences}
                    onAdd={(data) => expMutation.mutate(data)}
                    onDelete={(id) => deleteExpMutation.mutate(id)}
                    isPending={expMutation.isPending}
                  />
                  <EducationSection
                    educations={profile.educations}
                    onAdd={(data) => eduMutation.mutate(data)}
                    onDelete={(id) => deleteEduMutation.mutate(id)}
                    isPending={eduMutation.isPending}
                  />
                </div>
              )}

              {activeTab === 'skills' && (
                <div className="space-y-6">
                  <SkillsSection
                    skills={profile.skills}
                    onSaveSkills={(skills) => saveMutation.mutate({ skills })}
                    isPending={saveMutation.isPending}
                  />
                  <ProjectsSection
                    projects={profile.projects}
                    onAdd={(data) => projMutation.mutate(data)}
                    onDelete={(id) => deleteProjMutation.mutate(id)}
                    isPending={projMutation.isPending}
                  />
                </div>
              )}

              {activeTab === 'credentials' && (
                <div className="space-y-6">
                  <CertificationsSection
                    certifications={profile.certifications}
                    onAdd={(data) => certMutation.mutate(data)}
                    onDelete={(id) => deleteCertMutation.mutate(id)}
                    isPending={certMutation.isPending}
                  />
                  <LanguagesSection
                    languages={profile.languages}
                    onAdd={(data) => langMutation.mutate(data)}
                    onDelete={(id) => deleteLangMutation.mutate(id)}
                    isPending={langMutation.isPending}
                  />
                </div>
              )}

              {activeTab === 'preferences' && (
                <div className="space-y-6">
                  <JobPreferencesSection
                    profile={profile}
                    onSave={(data) => saveMutation.mutate(data)}
                    isPending={saveMutation.isPending}
                  />
                  <PrivacySettingsSection
                    profile={profile}
                    onSave={(data) => saveMutation.mutate(data)}
                    isPending={saveMutation.isPending}
                  />
                </div>
              )}

              {activeTab === 'history' && (
                <div className="space-y-6">
                  <ApplicationHistorySection candidateProfileId={profile.id} />
                  <InterviewHistorySection />
                </div>
              )}

              {activeTab === 'ai' && (
                <div className="space-y-6">
                  <AiProfileInsightsSection profile={profile} />
                </div>
              )}
            </>
          ) : (
            <Card variant="glass" className="p-8 text-center space-y-4">
              <h3 className="text-lg font-bold text-head">Initialize Your Enterprise Profile</h3>
              <p className="text-xs text-muted max-w-md mx-auto">
                Create your professional profile to unlock recruiter discovery, candidate matching, and AI recommendations.
              </p>
              <Button
                type="button"
                variant="primary"
                isLoading={saveMutation.isPending}
                onClick={() => saveMutation.mutate({ professionalSummary: 'Software Engineer candidate profile.', yearsOfExperience: 2 })}
              >
                Create Profile Suite
              </Button>
            </Card>
          )}

          {/* Resume & Documents Card */}
          {profileId && (
            <Card variant="glass" className="p-6 rounded-2xl border border-line space-y-4 text-left">
              <h3 className="font-display text-base font-bold text-head flex items-center gap-2">
                📄 Resume & Enterprise Documents
              </h3>

              <div className="space-y-4">
                {profile?.resumeBlobUrl ? (
                  <div className="text-xs text-text flex items-center gap-2">
                    <span>Current Resume:</span>
                    <a
                      href={profile.resumeBlobUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold text-accent hover:underline flex items-center gap-1"
                    >
                      <span>📥 Download Resume PDF/DOCX</span>
                    </a>
                  </div>
                ) : (
                  <p className="text-xs text-muted">No resume uploaded yet (PDF or DOCX max 5MB).</p>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="file"
                    accept=".pdf,.docx"
                    onChange={(e) => setResumeFile(e.target.files?.[0] ?? null)}
                    className="min-h-10 flex-1 cursor-pointer rounded-xl border border-line bg-surface p-2 text-xs text-text file:mr-3 file:rounded-lg file:border-0 file:bg-accent/20 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-accent"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={!resumeFile}
                    isLoading={resumeMutation.isPending}
                    onClick={() => resumeMutation.mutate()}
                  >
                    Upload Resume
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* AI Recommended Jobs */}
          {profileId && <JobRecommendations candidateProfileId={profileId} />}
        </div>
      </div>
    </div>
  )
}