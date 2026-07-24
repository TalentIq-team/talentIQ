import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  closeJob,
  createJob,
  publishJob,
  getManagedJobs,
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
    queryKey: ['jobs', 'manage'],
    queryFn: getManagedJobs,
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
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#001845] via-[#002855] to-[#7B2CBF] p-8 text-white shadow-xl border border-line">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white border border-white/20 mb-3">
              Recruiter Job Portal
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">Job Postings Management</h1>
            <p className="text-white/80 text-sm mt-1 max-w-xl">
              Create, publish, inspect candidate pipelines, and close active job requisitions across your organization.
            </p>
          </div>
        </div>
      </div>

      {banner && (
        <div className="rounded-2xl border border-line bg-panel-2 px-5 py-4 text-xs font-semibold text-head shadow-sm">
          {banner}
        </div>
      )}

      {/* Create Job Form */}
      <div className="bg-panel border border-line rounded-2xl p-6 shadow-sm space-y-6">
        <h2 className="text-lg font-bold text-head flex items-center gap-2 border-b border-line pb-4">
          <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create New Job Posting
        </h2>

        <form
          className="grid gap-5 sm:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault()
            createMutation.mutate()
          }}
        >
          <Input
            required
            label="Job Title"
            placeholder="e.g. Lead Full Stack Architect"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />

          <Input
            label="Location"
            placeholder="e.g. Remote / Colombo, Sri Lanka"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
          />

          <div className="sm:col-span-2 space-y-1.5">
            <label
              htmlFor="job-description"
              className="block text-xs font-semibold text-text"
            >
              Job Description & Responsibilities
            </label>

            <textarea
              id="job-description"
              className="w-full resize-y rounded-xl border border-line bg-panel-2 px-3.5 py-2.5 text-xs text-text placeholder:text-muted focus:outline-none focus:border-accent"
              placeholder="Detail role requirements, technical skills, and candidate expectations..."
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
          />

          <div className="mt-2 flex justify-end sm:col-span-2">
            <Button
              type="submit"
              variant="primary"
              isLoading={createMutation.isPending}
              className="px-6 py-2.5 bg-button-primary-bg text-button-primary-text font-bold text-xs rounded-xl shadow-md hover:brightness-110 cursor-pointer"
            >
              Create Job Draft
            </Button>
          </div>
        </form>
      </div>

      {jobsQuery.isLoading && <Spinner label="Loading postings…" />}

      {jobsQuery.isError && (
        <ErrorBanner message={toErrorMessage(jobsQuery.error)} />
      )}

      {/* Active Job Cards */}
      <div className="space-y-5">
        <h2 className="text-lg font-bold text-head border-b border-line pb-3">Active & Draft Requisitions</h2>

        {jobsQuery.data?.map((job) => (
          <div
            key={job.id}
            className="bg-panel border border-line rounded-2xl p-6 shadow-sm hover:border-m2/40 transition-all"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-lg font-bold text-head">
                    {job.title}
                  </h3>

                  <span className="inline-flex items-center rounded-lg border border-line bg-panel-2 px-2.5 py-1 text-[11px] font-mono font-bold text-m2">
                    Job ID: {job.id}
                  </span>

                  <span
                    className={`inline-flex items-center rounded-full border px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      job.status === JobPostingStatus.Published
                        ? 'border-ok/20 bg-ok/10 text-ok'
                        : job.status === JobPostingStatus.Closed
                          ? 'border-alert/20 bg-alert/10 text-alert'
                          : 'border-line bg-panel-2 text-muted'
                    }`}
                  >
                    {STATUS_LABEL[job.status]}
                  </span>
                </div>

                <p className="text-xs text-muted">
                  📍 {job.location || 'Remote'} · 💼 {EmploymentTypeLabels[job.employmentType]} · ⏳ {job.minExperienceYears}+ yrs experience
                </p>

                {job.description && (
                  <p className="mt-2 max-w-3xl text-xs leading-relaxed text-text">
                    {job.description}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-2.5">
                <Link to={`/recruiter/jobs/${job.id}/pipeline`}>
                  <button
                    className="px-4 py-2 bg-panel-2 hover:bg-line text-head font-bold text-xs rounded-xl border border-line transition-all cursor-pointer"
                  >
                    View Pipeline
                  </button>
                </Link>

                {job.status === JobPostingStatus.Draft && (
                  <button
                    disabled={publishMutation.isPending}
                    onClick={() => publishMutation.mutate(job.id)}
                    className="px-4 py-2 bg-ok/10 hover:bg-ok/20 text-ok border border-ok/20 font-bold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    Publish Job
                  </button>
                )}

                {job.status === JobPostingStatus.Published && (
                  <button
                    disabled={closeMutation.isPending}
                    onClick={() => closeMutation.mutate(job.id)}
                    className="px-4 py-2 bg-alert/10 hover:bg-alert/20 text-alert border border-alert/20 font-bold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    Close Requisition
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}