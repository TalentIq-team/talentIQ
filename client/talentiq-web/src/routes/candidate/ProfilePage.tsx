import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createCandidateProfile,
  getCandidateProfile,
  updateCandidateProfile,
  uploadResume,
} from '../../api/endpoints'
import { toErrorMessage } from '../../api/client'
import { getCandidateProfileId, setCandidateProfileId } from '../../api/session'
import { ErrorBanner, Spinner } from '../../components/Feedback'

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
      setBanner('Profile saved.')
      queryClient.invalidateQueries({ queryKey: ['candidate-profile'] })
    },
    onError: (error) => setBanner(toErrorMessage(error)),
  })

  const resumeMutation = useMutation({
    mutationFn: () => uploadResume(profileId!, resumeFile!),
    onSuccess: () => {
      setBanner('Resume uploaded.')
      setResumeFile(null)
      queryClient.invalidateQueries({ queryKey: ['candidate-profile', profileId] })
    },
    onError: (error) => setBanner(toErrorMessage(error)),
  })

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Candidate Profile</h1>
        <p className="text-sm text-slate-500">Create and manage your professional profile and resume.</p>
      </header>

      {banner && (
        <div className="rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm text-indigo-700">{banner}</div>
      )}

      {profileQuery.isLoading && <Spinner label="Loading profile…" />}
      {profileQuery.isError && <ErrorBanner message={toErrorMessage(profileQuery.error)} />}

      <form
        className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        onSubmit={(e) => {
          e.preventDefault()
          saveMutation.mutate()
        }}
      >
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Professional summary</label>
          <textarea
            required
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={4}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            placeholder="Experienced software engineer…"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Years of experience</label>
          <input
            type="number"
            min={0}
            step={0.5}
            value={years}
            onChange={(e) => setYears(Number(e.target.value))}
            className="w-40 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={saveMutation.isPending}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {saveMutation.isPending ? 'Saving…' : profileId ? 'Update profile' : 'Create profile'}
        </button>
        {profileId && <p className="text-xs text-slate-400">Profile id: {profileId}</p>}
      </form>

      <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-semibold">Resume (PDF / DOCX, max 5 MB)</h2>
        {!profileId && <p className="text-sm text-slate-500">Create your profile first to upload a resume.</p>}
        <input
          type="file"
          accept=".pdf,.docx"
          disabled={!profileId}
          onChange={(e) => setResumeFile(e.target.files?.[0] ?? null)}
          className="block text-sm"
        />
        {profileQuery.data?.resumeBlobUrl && (
          <p className="text-xs text-green-600">Current resume: {profileQuery.data.resumeBlobUrl}</p>
        )}
        <button
          type="button"
          disabled={!profileId || !resumeFile || resumeMutation.isPending}
          onClick={() => resumeMutation.mutate()}
          className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-900 disabled:opacity-50"
        >
          {resumeMutation.isPending ? 'Uploading…' : 'Upload resume'}
        </button>
      </section>
    </div>
  )
}
