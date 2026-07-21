import { useEffect, useState } from 'react'
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
import JobRecommendations from '@/features/ai/components/JobRecommendations'

import logo from '@/assets/logo.jpeg'

<div className="flex items-center gap-3 px-5 py-4">
  <img
    src={logo}
    alt="TalentIQ"
    className="h-10 w-10 rounded-xl object-cover"
  />

  <span className="text-xl font-bold text-white">
    TalentIQ
  </span>
</div>

export default function ProfilePage() {
  const queryClient = useQueryClient()

  const [profileId, setProfileId] = useState<string | null>(
    getCandidateProfileId()
  )
  const [summary, setSummary] = useState('')
  const [years, setYears] = useState(0)
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [banner, setBanner] = useState<string | null>(null)

  const profileQuery = useQuery({
    queryKey: ['candidate-profile', profileId],
    queryFn: () => getCandidateProfile(profileId!),
    enabled: Boolean(profileId),
  })

  useEffect(() => {
    if (!profileQuery.data) {
      return
    }

    setSummary(profileQuery.data.professionalSummary ?? '')
    setYears(profileQuery.data.yearsOfExperience ?? 0)
  }, [profileQuery.data])

  const saveMutation = useMutation({
    mutationFn: async () => {
      const profileData = {
        professionalSummary: summary,
        yearsOfExperience: Number(years),
        skillIds: [],
      }

      if (profileId) {
        return updateCandidateProfile(profileId, profileData)
      }

      return createCandidateProfile(profileData)
    },
    onSuccess: (profile) => {
      setProfileId(profile.id)
      setCandidateProfileId(profile.id)
      setBanner('Profile saved successfully.')

      queryClient.invalidateQueries({
        queryKey: ['candidate-profile'],
      })
    },
    onError: (error) => {
      setBanner(toErrorMessage(error))
    },
  })

  const resumeMutation = useMutation({
    mutationFn: () => uploadResume(profileId!, resumeFile!),
    onSuccess: () => {
      setBanner('Resume uploaded successfully.')
      setResumeFile(null)

      queryClient.invalidateQueries({
        queryKey: ['candidate-profile', profileId],
      })
    },
    onError: (error) => {
      setBanner(toErrorMessage(error))
    },
  })

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-[var(--heading)]">
          Candidate Profile
        </h1>

        <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
          Create and manage your professional profile and resume.
        </p>
      </header>

      {banner && (
        <Card
          variant="borderless"
          className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-sm font-medium text-[var(--text)] shadow-[var(--shadow-e1)]"
          role="status"
        >
          {banner}
        </Card>
      )}

      {profileQuery.isLoading && (
        <Spinner label="Loading profile…" />
      )}

      {profileQuery.isError && (
        <ErrorBanner message={toErrorMessage(profileQuery.error)} />
      )}

      <Card
        variant="glass"
        className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-e1)]"
      >
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault()
            saveMutation.mutate()
          }}
        >
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="professional-summary"
              className="text-xs font-semibold text-[var(--text)]"
            >
              Professional summary
            </label>

            <textarea
              id="professional-summary"
              required
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
              rows={4}
              className="w-full resize-y rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-2.5 font-sans text-sm text-[var(--text)] placeholder:text-[var(--placeholder)] transition-[border-color,box-shadow] duration-150 focus:border-[var(--ring)] focus:outline-none focus:ring-4 focus:ring-[color-mix(in_srgb,var(--ring)_22%,transparent)]"
              placeholder="Experienced software engineer…"
            />
          </div>

          <Input
            label="Years of experience"
            type="number"
            required
            min={0}
            value={years}
            onChange={(event) => setYears(Number(event.target.value))}
            className="min-h-11 rounded-lg border-[var(--border-strong)] bg-[var(--surface)] text-[var(--text)] placeholder:text-[var(--placeholder)] focus:border-[var(--ring)] focus:ring-[color-mix(in_srgb,var(--ring)_22%,transparent)]"
          />

          <Button
            type="submit"
            variant="primary"
            className="min-h-11 w-full rounded-xl bg-[var(--primary)] font-semibold text-[var(--on-primary)] shadow-[var(--shadow-e1)] hover:bg-[var(--primary-hover)] hover:shadow-[var(--glow-primary)] focus:ring-[var(--ring)]"
            isLoading={saveMutation.isPending}
          >
            Save Profile
          </Button>
        </form>
      </Card>

      {profileId && (
        <>
          <Card
            variant="glass"
            className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-e1)]"
          >
            <h3 className="mb-4 font-display text-lg font-semibold tracking-tight text-[var(--heading)]">
              Resume Document
            </h3>

            <div className="space-y-4">
              {profileQuery.data?.resumeBlobUrl ? (
                <div className="text-sm text-[var(--text)]">
                  Current Resume:{' '}
                  <a
                    href={profileQuery.data.resumeBlobUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-[var(--primary)] transition-colors hover:text-[var(--primary-hover)] hover:underline"
                  >
                    Download PDF/DOCX
                  </a>
                </div>
              ) : (
                <div className="text-sm text-[var(--muted)]">
                  No resume uploaded yet (PDF or DOCX max 5MB).
                </div>
              )}

              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="file"
                  accept=".pdf,.docx"
                  onChange={(event) =>
                    setResumeFile(event.target.files?.[0] ?? null)
                  }
                  className="min-h-11 flex-1 cursor-pointer rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-[var(--primary-subtle)] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                />

                <Button
                  type="button"
                  variant="secondary"
                  disabled={!resumeFile}
                  isLoading={resumeMutation.isPending}
                  onClick={() => resumeMutation.mutate()}
                  className="min-h-11 rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] font-semibold text-[var(--text)] hover:bg-[var(--surface-2)] focus:ring-[var(--ring)] sm:px-5"
                >
                  Upload
                </Button>
              </div>
            </div>
          </Card>

          <JobRecommendations candidateProfileId={profileId} />
        </>
      )}
    </div>
  )
}