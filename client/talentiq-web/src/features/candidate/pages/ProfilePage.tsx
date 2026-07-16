import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createCandidateProfile,
  getCandidateProfile,
  updateCandidateProfile,
  uploadResume,
} from '@/api/endpoints'
import { toErrorMessage } from '@/lib/api'
import { getCandidateProfileId, setCandidateProfileId } from '@/api/session'
import { Spinner, ErrorBanner } from '@/components/Feedback'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'

export default function ProfilePage() {
  const queryClient = useQueryClient()
  const [profileId, setProfileId] = useState<string | null>(getCandidateProfileId())
  const [summary, setSummary] = useState('')
  const [years, setYears] = useState(0)
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [banner, setBanner] = useState<string | null>(null)

  const profileQuery = useQuery({
    queryKey: ['candidate-profile', profileId],
    queryFn: () => getCandidateProfile(profileId!),
    enabled: !!profileId,
  })

  // Sync form fields when the profile loads.
  if (profileQuery.data && summary === '' && profileQuery.data.professionalSummary) {
    setSummary(profileQuery.data.professionalSummary)
    setYears(profileQuery.data.yearsOfExperience)
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (profileId) {
        return updateCandidateProfile(profileId, {
          professionalSummary: summary,
          yearsOfExperience: Number(years),
          skillIds: [],
        })
      }
      return createCandidateProfile({
        professionalSummary: summary,
        yearsOfExperience: Number(years),
        skillIds: [],
      })
    },
    onSuccess: (profile) => {
      setProfileId(profile.id)
      setCandidateProfileId(profile.id)
      setBanner('Profile saved successfully.')
      queryClient.invalidateQueries({ queryKey: ['candidate-profile'] })
    },
    onError: (error) => setBanner(toErrorMessage(error)),
  })

  const resumeMutation = useMutation({
    mutationFn: () => uploadResume(profileId!, resumeFile!),
    onSuccess: () => {
      setBanner('Resume uploaded successfully.')
      setResumeFile(null)
      queryClient.invalidateQueries({ queryKey: ['candidate-profile', profileId] })
    },
    onError: (error) => setBanner(toErrorMessage(error)),
  })

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Candidate Profile</h1>
        <p className="text-sm text-muted">Create and manage your professional profile and resume.</p>
      </header>

      {banner && (
        <Card variant="borderless" className="bg-m2/10 border border-m2/20 px-4 py-3 text-sm text-head font-medium">
          {banner}
        </Card>
      )}

      {profileQuery.isLoading && <Spinner label="Loading profile…" />}
      {profileQuery.isError && <ErrorBanner message={toErrorMessage(profileQuery.error)} />}

      <Card variant="glass" className="p-6">
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            saveMutation.mutate()
          }}
        >
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-muted uppercase tracking-wider">
              Professional summary
            </label>
            <textarea
              required
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-line bg-panel-2 px-4 py-2.5 text-sm text-head placeholder-muted transition-all duration-200 focus:border-m2 focus:ring-1 focus:ring-m2/30 focus:outline-none"
              placeholder="Experienced software engineer…"
            />
          </div>
          <Input
            label="Years of experience"
            type="number"
            required
            value={years}
            onChange={(e) => setYears(Number(e.target.value))}
          />
          <Button type="submit" variant="primary" className="w-full" isLoading={saveMutation.isPending}>
            Save Profile
          </Button>
        </form>
      </Card>

      {profileId && (
        <Card variant="glass" className="p-6">
          <h3 className="text-lg font-bold mb-4">Resume Document</h3>
          <div className="space-y-4">
            {profileQuery.data?.resumeBlobUrl ? (
              <div className="text-sm text-head">
                Current Resume:{' '}
                <a
                  href={profileQuery.data.resumeBlobUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-m3 hover:underline"
                >
                  Download PDF/DOCX
                </a>
              </div>
            ) : (
              <div className="text-sm text-muted">No resume uploaded yet (PDF or DOCX max 5MB).</div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="file"
                accept=".pdf,.docx"
                onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                className="flex-1 rounded-xl border border-line bg-panel-2 px-4 py-2 text-sm text-head focus:outline-none"
              />
              <Button
                type="button"
                variant="secondary"
                disabled={!resumeFile}
                isLoading={resumeMutation.isPending}
                onClick={() => resumeMutation.mutate()}
              >
                Upload
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
