import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { searchJobs, submitApplication, type JobSearchFilters } from '@/api/endpoints'
import { EmploymentType, EmploymentTypeLabels, type JobPosting } from '@/api/types'
import { toErrorMessage } from '@/lib/api'
import { getCandidateProfileId } from '@/api/session'
import { EmptyState, Spinner, ErrorBanner } from '@/components/Feedback'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import JobRecommendations from '@/features/ai/components/JobRecommendations'
import '@/features/ai/components/AiPanels.css'

export default function JobSearchPage() {
  const [filters, setFilters] = useState<JobSearchFilters>({})
  const [applied, setApplied] = useState<Record<string, string>>({})
  const profileId = getCandidateProfileId()

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

  const selectOptions = [
    { value: '', label: 'Any employment type' },
    ...Object.values(EmploymentType)
      .filter((v): v is EmploymentType => typeof v === 'number')
      .map((t) => ({ value: t, label: EmploymentTypeLabels[t] })),
  ]

  const titleIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  )

  const locationIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )

  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <h1 className="text-2xl font-black text-head tracking-tight">Job Opportunities</h1>
        <p className="text-xs text-muted mt-1">Browse open positions, check skill matching suggestions, and apply.</p>
      </header>

      {/* AI Recommendations Section */}
      {profileId ? (
        <JobRecommendations candidateProfileId={profileId} className="mb-6" />
      ) : (
        <div className="ai-glass-panel p-4 text-center text-xs text-muted border border-dashed">
          💡 Create your candidate profile (via the Profile tab) to view personalized AI match suggestions!
        </div>
      )}

      {/* Search Filters Card */}
      <div className="ai-glass-panel p-5 grid gap-4 sm:grid-cols-4 items-end" style={{ padding: '20px' }}>
        <Input
          label="Job Title"
          placeholder="e.g. Frontend Engineer"
          icon={titleIcon}
          value={filters.title ?? ''}
          onChange={(e) => setFilters((f) => ({ ...f, title: e.target.value || undefined }))}
        />
        <Input
          label="Location"
          placeholder="e.g. Remote"
          icon={locationIcon}
          value={filters.location ?? ''}
          onChange={(e) => setFilters((f) => ({ ...f, location: e.target.value || undefined }))}
        />
        <Select
          label="Employment Type"
          options={selectOptions}
          value={filters.employmentType ?? ''}
          onChange={(e) =>
            setFilters((f) => ({
              ...f,
              employmentType: e.target.value ? (Number(e.target.value) as EmploymentType) : undefined,
            }))
          }
        />
        <Button
          type="button"
          onClick={() => jobsQuery.refetch()}
          variant="primary"
          className="w-full h-[42px] font-bold rounded-xl"
        >
          Search Jobs
        </Button>
      </div>

      {jobsQuery.isLoading && <Spinner label="Searching jobs…" />}
      {jobsQuery.isError && <ErrorBanner message={toErrorMessage(jobsQuery.error)} />}
      {jobsQuery.data?.length === 0 && <EmptyState message="No open positions match your filters." />}

      <div className="space-y-4">
        {jobsQuery.data?.map((job: JobPosting) => {
          const isApplied = applied[job.id] === 'Applied ✓'
          const buttonText = applied[job.id] || 'Quick Apply'

          return (
            <div
              key={job.id}
              className="rounded-xl border border-line bg-panel p-6 shadow-sm hover:border-accent/40 transition-all duration-200"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-2">
                  <div>
                    <h3 className="text-base font-bold text-head">{job.title}</h3>
                    <div className="flex flex-wrap gap-2 items-center text-[11px] text-muted mt-1 font-mono">
                      <span>{job.location || 'Remote'}</span>
                      <span>•</span>
                      <span>{EmploymentTypeLabels[job.employmentType]}</span>
                      <span>•</span>
                      <span>Min. {job.minExperienceYears} yrs experience required</span>
                    </div>
                  </div>
                  {job.description && (
                    <p className="mt-3 text-xs text-text leading-relaxed bg-panel-2/10 p-3 rounded-lg border border-line/50">
                      {job.description}
                    </p>
                  )}
                </div>
                <div className="text-right self-center">
                  <Button
                    type="button"
                    variant={isApplied ? 'outline' : 'primary'}
                    disabled={applyMutation.isPending || isApplied}
                    onClick={() => applyMutation.mutate(job.id)}
                    className="font-semibold text-xs px-5 py-2 rounded-xl"
                  >
                    {buttonText}
                  </Button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
