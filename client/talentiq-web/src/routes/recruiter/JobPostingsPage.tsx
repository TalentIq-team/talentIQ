import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { closeJob, createJob, publishJob, searchJobs } from '../../api/endpoints'
import { EmploymentType, EmploymentTypeLabels, JobPostingStatus } from '../../api/types'
import { toErrorMessage } from '../../api/client'
import { getOrganizationId } from '../../api/session'
import { ErrorBanner, Spinner } from '../../components/Feedback'

const STATUS_LABEL: Record<JobPostingStatus, string> = {
  [JobPostingStatus.Draft]: 'Draft',
  [JobPostingStatus.Published]: 'Published',
  [JobPostingStatus.Closed]: 'Closed',
}

export default function JobPostingsPage() {
  const queryClient = useQueryClient()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [employmentType, setEmploymentType] = useState<EmploymentType>(EmploymentType.FullTime)
  const [minExp, setMinExp] = useState(0)
  const [banner, setBanner] = useState<string | null>(null)

  // Published-only search is the public feed; recruiters still see their created drafts in this session.
  const jobsQuery = useQuery({ queryKey: ['jobs', {}], queryFn: () => searchJobs({}) })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['jobs'] })

  const createMutation = useMutation({
    mutationFn: () =>
      createJob({
        organizationId: getOrganizationId(),
        title,
        description,
        location,
        employmentType,
        minExperienceYears: Number(minExp),
        skillIds: [],
      }),
    onSuccess: (job) => {
      setBanner(`Created draft "${job.title}". Publish it to make it visible to candidates.`)
      setTitle('')
      setDescription('')
      setLocation('')
      invalidate()
    },
    onError: (error) => setBanner(toErrorMessage(error)),
  })

  const publishMutation = useMutation({
    mutationFn: (id: string) => publishJob(id),
    onSuccess: () => invalidate(),
    onError: (error) => setBanner(toErrorMessage(error)),
  })

  const closeMutation = useMutation({
    mutationFn: (id: string) => closeJob(id),
    onSuccess: () => invalidate(),
    onError: (error) => setBanner(toErrorMessage(error)),
  })

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Job Postings</h1>
        <p className="text-sm text-slate-500">Create, publish and close job postings.</p>
      </header>

      {banner && (
        <div className="rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm text-indigo-700">{banner}</div>
      )}

      <form
        className="grid gap-3 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault()
          createMutation.mutate()
        }}
      >
        <input
          required
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          placeholder="Job title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <textarea
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm sm:col-span-2"
          placeholder="Description"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <select
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          value={employmentType}
          onChange={(e) => setEmploymentType(Number(e.target.value) as EmploymentType)}
        >
          {Object.values(EmploymentType)
            .filter((v): v is EmploymentType => typeof v === 'number')
            .map((t) => (
              <option key={t} value={t}>
                {EmploymentTypeLabels[t]}
              </option>
            ))}
        </select>
        <input
          type="number"
          min={0}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          placeholder="Min experience (years)"
          value={minExp}
          onChange={(e) => setMinExp(Number(e.target.value))}
        />
        <button
          type="submit"
          disabled={createMutation.isPending}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 sm:col-span-2"
        >
          {createMutation.isPending ? 'Creating…' : 'Create job posting'}
        </button>
      </form>

      <section className="space-y-3">
        <h2 className="font-semibold">Published jobs</h2>
        {jobsQuery.isLoading && <Spinner />}
        {jobsQuery.isError && <ErrorBanner message={toErrorMessage(jobsQuery.error)} />}
        {jobsQuery.data?.map((job) => (
          <div
            key={job.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div>
              <h3 className="font-semibold">{job.title}</h3>
              <p className="text-sm text-slate-500">
                {job.location || 'Remote'} · {EmploymentTypeLabels[job.employmentType]} ·{' '}
                <span className="font-medium">{STATUS_LABEL[job.status]}</span>
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                to={`/recruiter/jobs/${job.id}/pipeline`}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Pipeline
              </Link>
              {job.status !== JobPostingStatus.Published && (
                <button
                  type="button"
                  onClick={() => publishMutation.mutate(job.id)}
                  className="rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700"
                >
                  Publish
                </button>
              )}
              {job.status !== JobPostingStatus.Closed && (
                <button
                  type="button"
                  onClick={() => closeMutation.mutate(job.id)}
                  className="rounded-lg bg-slate-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}
