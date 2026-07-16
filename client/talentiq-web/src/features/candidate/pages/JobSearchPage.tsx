import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { searchJobs, submitApplication, type JobSearchFilters } from '@/api/endpoints'
import { EmploymentType, EmploymentTypeLabels, type JobPosting } from '@/api/types'
import { toErrorMessage } from '@/lib/api'
import { getCandidateProfileId } from '@/api/session'
import { EmptyState, Spinner, ErrorBanner } from '@/components/Feedback'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'

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

  const selectOptions = [
    { value: '', label: 'Any employment type' },
    ...Object.values(EmploymentType)
      .filter((v): v is EmploymentType => typeof v === 'number')
      .map((t) => ({ value: t, label: EmploymentTypeLabels[t] })),
  ]

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Job Search</h1>
        <p className="text-sm text-muted">Browse open positions and apply.</p>
      </header>

      <Card variant="glass" className="p-4 grid gap-4 sm:grid-cols-4 items-end">
        <Input
          label="Title"
          placeholder="e.g. Software Engineer"
          value={filters.title ?? ''}
          onChange={(e) => setFilters((f) => ({ ...f, title: e.target.value || undefined }))}
        />
        <Input
          label="Location"
          placeholder="e.g. Colombo"
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
          className="w-full h-[42px]"
        >
          Search
        </Button>
      </Card>

      {jobsQuery.isLoading && <Spinner label="Searching jobs…" />}
      {jobsQuery.isError && <ErrorBanner message={toErrorMessage(jobsQuery.error)} />}
      {jobsQuery.data?.length === 0 && <EmptyState message="No open positions match your filters." />}

      <div className="space-y-4">
        {jobsQuery.data?.map((job: JobPosting) => (
          <Card key={job.id} variant="glass" className="p-6 hover:border-m2/30 duration-200">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold">{job.title}</h3>
                <p className="text-xs text-muted mt-1">
                  {job.location || 'Remote'} · {EmploymentTypeLabels[job.employmentType]} ·{' '}
                  {job.minExperienceYears}+ yrs
                </p>
                {job.description && <p className="mt-3 text-sm text-text leading-relaxed">{job.description}</p>}
              </div>
              <div className="text-right">
                <Button
                  type="button"
                  variant="primary"
                  disabled={applyMutation.isPending || applied[job.id] === 'Applied ✓'}
                  onClick={() => applyMutation.mutate(job.id)}
                >
                  {applied[job.id] || 'Apply'}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
