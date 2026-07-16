import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { closeJob, createJob, publishJob, searchJobs } from '@/api/endpoints'
import { EmploymentType, EmploymentTypeLabels, JobPostingStatus } from '@/api/types'
import { toErrorMessage } from '@/lib/api'
import { getOrganizationId } from '@/api/session'
import { Spinner, ErrorBanner } from '@/components/Feedback'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Card from '@/components/ui/Card'

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

  const selectOptions = Object.values(EmploymentType)
    .filter((v): v is EmploymentType => typeof v === 'number')
    .map((t) => ({ value: t, label: EmploymentTypeLabels[t] }))

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Job Postings</h1>
        <p className="text-sm text-muted">Create, publish and close job postings.</p>
      </header>

      {banner && (
        <Card variant="borderless" className="bg-m2/10 border border-m2/20 px-4 py-3 text-sm text-head font-medium">
          {banner}
        </Card>
      )}

      <Card variant="glass" className="p-6">
        <form
          className="grid gap-4 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault()
            createMutation.mutate()
          }}
        >
          <Input
            required
            label="Job Title"
            placeholder="e.g. Lead Designer"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Input
            label="Location"
            placeholder="e.g. Remote / Colombo"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-semibold text-muted uppercase tracking-wider">
              Description
            </label>
            <textarea
              className="w-full rounded-xl border border-line bg-panel-2 px-4 py-2.5 text-sm text-head placeholder-muted transition-all duration-200 focus:border-m2 focus:ring-1 focus:ring-m2/30 focus:outline-none"
              placeholder="Job specifications..."
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <Select
            label="Employment Type"
            options={selectOptions}
            value={employmentType}
            onChange={(e) => setEmploymentType(Number(e.target.value) as EmploymentType)}
          />
          <Input
            label="Minimum Experience (Years)"
            type="number"
            value={minExp}
            onChange={(e) => setMinExp(Number(e.target.value))}
          />
          <div className="sm:col-span-2 flex justify-end mt-2">
            <Button type="submit" variant="primary" isLoading={createMutation.isPending}>
              Create Job Posting
            </Button>
          </div>
        </form>
      </Card>

      {jobsQuery.isLoading && <Spinner label="Loading postings…" />}
      {jobsQuery.isError && <ErrorBanner message={toErrorMessage(jobsQuery.error)} />}

      <div className="space-y-4">
        {jobsQuery.data?.map((job) => (
          <Card key={job.id} variant="glass" className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold">{job.title}</h3>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      job.status === JobPostingStatus.Published
                        ? 'bg-ok/10 text-ok border border-ok/20'
                        : job.status === JobPostingStatus.Closed
                        ? 'bg-alert/10 text-alert border border-alert/20'
                        : 'bg-line text-muted'
                    }`}
                  >
                    {STATUS_LABEL[job.status]}
                  </span>
                </div>
                <p className="text-xs text-muted mt-1.5">
                  {job.location || 'Remote'} · {EmploymentTypeLabels[job.employmentType]} ·{' '}
                  {job.minExperienceYears}+ yrs
                </p>
                {job.description && (
                  <p className="mt-3 text-sm text-text leading-relaxed max-w-2xl">{job.description}</p>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <Link to={`/recruiter/jobs/${job.id}/pipeline`}>
                  <Button variant="secondary" size="sm">
                    View Pipeline
                  </Button>
                </Link>
                {job.status === JobPostingStatus.Draft && (
                  <Button
                    variant="outline"
                    size="sm"
                    isLoading={publishMutation.isPending}
                    onClick={() => publishMutation.mutate(job.id)}
                  >
                    Publish
                  </Button>
                )}
                {job.status === JobPostingStatus.Published && (
                  <Button
                    variant="danger"
                    size="sm"
                    isLoading={closeMutation.isPending}
                    onClick={() => closeMutation.mutate(job.id)}
                  >
                    Close
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
