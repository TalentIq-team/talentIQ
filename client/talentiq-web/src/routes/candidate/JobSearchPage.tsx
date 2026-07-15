import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { searchJobs, submitApplication, type JobSearchFilters } from '../../api/endpoints'
import { EmploymentType, EmploymentTypeLabels, type JobPosting } from '../../api/types'
import { toErrorMessage } from '../../api/client'
import { getCandidateProfileId } from '../../api/session'
import { EmptyState, ErrorBanner, Spinner } from '../../components/Feedback'

export default function JobSearchPage() {
  const [filters, setFilters] = useState<JobSearchFilters>({})
  const [applied, setApplied] = useState<Record<string, string>>({})

  const jobsQuery = useQuery({
    queryKey: ['jobs', filters],
    queryFn: () => searchJobs(filters),
  })

  const applyMutation = useMutation({
    mutationFn: (jobId: string) => {
      const profileId = getCandidateProfileId()
      if (!profileId) throw new Error('Create your candidate profile first.')
      return submitApplication(jobId, profileId)
    },
    onSuccess: (_, jobId) => setApplied((prev) => ({ ...prev, [jobId]: 'Applied ✓' })),
    onError: (error, jobId) => setApplied((prev) => ({ ...prev, [jobId]: toErrorMessage(error) })),
  })

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Job Search</h1>
        <p className="text-sm text-slate-500">Browse open positions and apply.</p>
      </header>

      <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-4">
        <input
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          placeholder="Title"
          value={filters.title ?? ''}
          onChange={(e) => setFilters((f) => ({ ...f, title: e.target.value || undefined }))}
        />
        <input
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          placeholder="Location"
          value={filters.location ?? ''}
          onChange={(e) => setFilters((f) => ({ ...f, location: e.target.value || undefined }))}
        />
        <select
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          value={filters.employmentType ?? ''}
          onChange={(e) =>
            setFilters((f) => ({
              ...f,
              employmentType: e.target.value ? (Number(e.target.value) as EmploymentType) : undefined,
            }))
          }
        >
          <option value="">Any employment type</option>
          {Object.values(EmploymentType)
            .filter((v): v is EmploymentType => typeof v === 'number')
            .map((t) => (
              <option key={t} value={t}>
                {EmploymentTypeLabels[t]}
              </option>
            ))}
        </select>
        <button
          type="button"
          onClick={() => jobsQuery.refetch()}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Search
        </button>
      </div>

      {jobsQuery.isLoading && <Spinner label="Searching jobs…" />}
      {jobsQuery.isError && <ErrorBanner message={toErrorMessage(jobsQuery.error)} />}
      {jobsQuery.data?.length === 0 && <EmptyState message="No open positions match your filters." />}

      <div className="space-y-3">
        {jobsQuery.data?.map((job: JobPosting) => (
          <div key={job.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold">{job.title}</h3>
                <p className="text-sm text-slate-500">
                  {job.location || 'Remote'} · {EmploymentTypeLabels[job.employmentType]} ·{' '}
                  {job.minExperienceYears}+ yrs
                </p>
                {job.description && <p className="mt-2 text-sm text-slate-600">{job.description}</p>}
              </div>
              <div className="text-right">
                <button
                  type="button"
                  disabled={applyMutation.isPending || applied[job.id] === 'Applied ✓'}
                  onClick={() => applyMutation.mutate(job.id)}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  Apply
                </button>
                {applied[job.id] && (
                  <p
                    className={`mt-1 text-xs ${
                      applied[job.id] === 'Applied ✓' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {applied[job.id]}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
