import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  closeJob,
  createJob,
  publishJob,
  searchJobs,
} from '@/api/endpoints'
import {
  EmploymentType,
  EmploymentTypeLabels,
  JobPostingStatus,
} from '@/api/types'
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
  const [employmentType, setEmploymentType] =
    useState<EmploymentType>(EmploymentType.FullTime)
  const [minExp, setMinExp] = useState(0)
  const [banner, setBanner] = useState<string | null>(null)

  const jobsQuery = useQuery({
    queryKey: ['jobs', {}],
    queryFn: () => searchJobs({}),
  })

  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: ['jobs'],
    })

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
      setBanner(
        `Created draft "${job.title}". Publish it to make it visible to candidates.`,
      )
      setTitle('')
      setDescription('')
      setLocation('')
      invalidate()
    },
    onError: (error) => {
      setBanner(toErrorMessage(error))
    },
  })

  const publishMutation = useMutation({
    mutationFn: (id: string) => publishJob(id),
    onSuccess: () => {
      invalidate()
    },
    onError: (error) => {
      setBanner(toErrorMessage(error))
    },
  })

  const closeMutation = useMutation({
    mutationFn: (id: string) => closeJob(id),
    onSuccess: () => {
      invalidate()
    },
    onError: (error) => {
      setBanner(toErrorMessage(error))
    },
  })

  const selectOptions = Object.values(EmploymentType)
    .filter((value): value is EmploymentType => typeof value === 'number')
    .map((type) => ({
      value: type,
      label: EmploymentTypeLabels[type],
    }))

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-[var(--heading)]">
          Job Postings
        </h1>

        <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
          Create, publish and close job postings.
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

      <Card
        variant="glass"
        className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-e1)]"
      >
        <form
          className="grid gap-4 sm:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault()
            createMutation.mutate()
          }}
        >
          <Input
            required
            label="Job Title"
            placeholder="e.g. Lead Designer"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="min-h-11 rounded-lg border-[var(--border-strong)] bg-[var(--surface)] text-[var(--text)] placeholder:text-[var(--placeholder)] focus:border-[var(--ring)] focus:ring-[color-mix(in_srgb,var(--ring)_22%,transparent)]"
          />

          <Input
            label="Location"
            placeholder="e.g. Remote / Colombo"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            className="min-h-11 rounded-lg border-[var(--border-strong)] bg-[var(--surface)] text-[var(--text)] placeholder:text-[var(--placeholder)] focus:border-[var(--ring)] focus:ring-[color-mix(in_srgb,var(--ring)_22%,transparent)]"
          />

          <div className="sm:col-span-2">
            <label
              htmlFor="job-description"
              className="mb-1.5 block text-xs font-semibold text-[var(--text)]"
            >
              Description
            </label>

            <textarea
              id="job-description"
              className="w-full resize-y rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--text)] placeholder:text-[var(--placeholder)] transition-[border-color,box-shadow] duration-150 focus:border-[var(--ring)] focus:outline-none focus:ring-4 focus:ring-[color-mix(in_srgb,var(--ring)_22%,transparent)]"
              placeholder="Job specifications..."
              rows={3}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>

          <Select
            label="Employment Type"
            options={selectOptions}
            value={employmentType}
            onChange={(event) =>
              setEmploymentType(
                Number(event.target.value) as EmploymentType,
              )
            }
          />

          <Input
            label="Minimum Experience (Years)"
            type="number"
            min={0}
            value={minExp}
            onChange={(event) => setMinExp(Number(event.target.value))}
            className="min-h-11 rounded-lg border-[var(--border-strong)] bg-[var(--surface)] text-[var(--text)] focus:border-[var(--ring)] focus:ring-[color-mix(in_srgb,var(--ring)_22%,transparent)]"
          />

          <div className="mt-2 flex justify-end sm:col-span-2">
            <Button
              type="submit"
              variant="primary"
              isLoading={createMutation.isPending}
              className="min-h-11 rounded-xl bg-[var(--primary)] font-semibold text-[var(--on-primary)] shadow-[var(--shadow-e1)] hover:bg-[var(--primary-hover)] hover:shadow-[var(--glow-primary)] focus:ring-[var(--ring)]"
            >
              Create Job Posting
            </Button>
          </div>
        </form>
      </Card>

      {jobsQuery.isLoading && <Spinner label="Loading postings…" />}

      {jobsQuery.isError && (
        <ErrorBanner message={toErrorMessage(jobsQuery.error)} />
      )}

      <div className="space-y-4">
        {jobsQuery.data?.map((job) => (
          <Card
            key={job.id}
            variant="glass"
            className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-e1)]"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="font-display text-lg font-semibold tracking-tight text-[var(--heading)]">
                    {job.title}
                  </h3>

                  <span
                    className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${
                      job.status === JobPostingStatus.Published
                        ? 'border-[var(--success-border)] bg-[var(--success-subtle)] text-[var(--success)]'
                        : job.status === JobPostingStatus.Closed
                          ? 'border-[var(--danger-border)] bg-[var(--danger-subtle)] text-[var(--danger)]'
                          : 'border-[var(--border)] bg-[var(--surface-2)] text-[var(--muted)]'
                    }`}
                  >
                    {STATUS_LABEL[job.status]}
                  </span>
                </div>

                <p className="mt-1.5 text-xs text-[var(--muted)]">
                  {job.location || 'Remote'} ·{' '}
                  {EmploymentTypeLabels[job.employmentType]} ·{' '}
                  {job.minExperienceYears}+ yrs
                </p>

                {job.description && (
                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--text)]">
                    {job.description}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <Link to={`/recruiter/jobs/${job.id}/pipeline`}>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="min-h-11 rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] font-semibold text-[var(--text)] hover:bg-[var(--surface-2)] focus:ring-[var(--ring)]"
                  >
                    View Pipeline
                  </Button>
                </Link>

                {job.status === JobPostingStatus.Draft && (
                  <Button
                    variant="outline"
                    size="sm"
                    isLoading={publishMutation.isPending}
                    onClick={() => publishMutation.mutate(job.id)}
                    className="min-h-11 rounded-xl border border-[var(--border-strong)] bg-transparent font-semibold text-[var(--text)] hover:border-[var(--primary)] hover:bg-[var(--surface-2)] focus:ring-[var(--ring)]"
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
                    className="min-h-11 rounded-xl bg-[var(--danger)] font-semibold text-white hover:bg-[var(--danger-hover)] focus:ring-[var(--danger)]"
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