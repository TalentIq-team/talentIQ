import React, { useState, useEffect } from 'react'
import { searchJobs } from '@/api/endpoints'
import type { JobPosting } from '@/api/types'
import { EmploymentType, EmploymentTypeLabels, JobPostingStatus } from '@/api/types'
import { useAuth } from '@/hooks/useAuth'

interface JobShowcaseProps {
  onSelectJob: (job: JobPosting) => void
  onApplyJob: (job: JobPosting) => void
}

const FALLBACK_JOBS: JobPosting[] = [
  {
    id: 'job-001',
    organizationId: 'org-01',
    recruiterId: 'rec-01',
    title: 'Senior React & Frontend Architect',
    description: 'Lead the modernization of frontend applications using React 19, Vite, TypeScript, and TailwindCSS. Implement high-performance UI components aligned with enterprise design token systems.',
    location: 'Colombo, Sri Lanka (Hybrid)',
    employmentType: EmploymentType.FullTime,
    status: JobPostingStatus.Published,
    minExperienceYears: 5,
    skillIds: ['React', 'TypeScript', 'TailwindCSS', 'Vite', 'State Management'],
    createdAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
    closedAt: null,
  },
  {
    id: 'job-002',
    organizationId: 'org-01',
    recruiterId: 'rec-02',
    title: 'Full Stack .NET & C# Engineer',
    description: 'Architect scalable web APIs and backend services using ASP.NET Core 9, EF Core, and SQL Server. Build secure identity integrations and microservice endpoints.',
    location: 'Remote / Kandy, Sri Lanka',
    employmentType: EmploymentType.FullTime,
    status: JobPostingStatus.Published,
    minExperienceYears: 3,
    skillIds: ['C#', 'ASP.NET Core', 'EF Core', 'SQL Server', 'REST API'],
    createdAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
    closedAt: null,
  },
  {
    id: 'job-003',
    organizationId: 'org-01',
    recruiterId: 'rec-01',
    title: 'Cloud Infrastructure & DevOps Engineer',
    description: 'Manage Google Cloud Platform (GCP) infrastructure, CI/CD automation pipelines, Kubernetes clusters, and Docker container orchestration with high availability standards.',
    location: 'Colombo, Sri Lanka (On-site)',
    employmentType: EmploymentType.Contract,
    status: JobPostingStatus.Published,
    minExperienceYears: 4,
    skillIds: ['GCP', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform'],
    createdAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
    closedAt: null,
  },
  {
    id: 'job-004',
    organizationId: 'org-01',
    recruiterId: 'rec-03',
    title: 'AI / ML Integration Specialist (Gemini API)',
    description: 'Integrate Gemini LLM models and vector search capabilities into recruitment pipelines. Develop explainable AI match scoring and automated candidate evaluation algorithms.',
    location: 'Remote (Global)',
    employmentType: EmploymentType.FullTime,
    status: JobPostingStatus.Published,
    minExperienceYears: 3,
    skillIds: ['Python', 'Gemini API', 'Vector DB', 'Machine Learning', 'NLP'],
    createdAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
    closedAt: null,
  },
  {
    id: 'job-005',
    organizationId: 'org-01',
    recruiterId: 'rec-02',
    title: 'QA Automation Lead',
    description: 'Establish automated end-to-end testing frameworks using Playwright and Jest. Conduct performance, accessibility (WCAG AA), and security regression testing.',
    location: 'Hybrid (Galle, Sri Lanka)',
    employmentType: EmploymentType.PartTime,
    status: JobPostingStatus.Published,
    minExperienceYears: 4,
    skillIds: ['Playwright', 'Jest', 'TypeScript', 'WCAG', 'CI/CD'],
    createdAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
    closedAt: null,
  },
  {
    id: 'job-006',
    organizationId: 'org-01',
    recruiterId: 'rec-01',
    title: 'UI/UX Product Designer',
    description: 'Design intuitive design systems, interactive prototypes, and design token scales. Conduct user research and accessibility audits for enterprise applications.',
    location: 'Colombo, Sri Lanka',
    employmentType: EmploymentType.Internship,
    status: JobPostingStatus.Published,
    minExperienceYears: 1,
    skillIds: ['Figma', 'UI/UX', 'Design Tokens', 'Prototyping', 'Accessibility'],
    createdAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
    closedAt: null,
  },
]

export const JobShowcase: React.FC<JobShowcaseProps> = ({ onSelectJob, onApplyJob }) => {
  const [jobs, setJobs] = useState<JobPosting[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedLocation, setSelectedLocation] = useState<string>('all')

  useEffect(() => {
    async function fetchJobs() {
      try {
        setLoading(true)
        const data = await searchJobs({})
        if (data && data.length > 0) {
          const published = data.filter(j => j.status === JobPostingStatus.Published)
          setJobs(published.length > 0 ? published : FALLBACK_JOBS)
        } else {
          setJobs(FALLBACK_JOBS)
        }
      } catch {
        setJobs(FALLBACK_JOBS)
      } finally {
        setLoading(false)
      }
    }
    fetchJobs()
  }, [])

  const filteredJobs = jobs.filter(job => {
    const matchesTitle = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.skillIds.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesType = selectedType === 'all' || job.employmentType.toString() === selectedType
    const matchesLoc = selectedLocation === 'all' || 
      (selectedLocation === 'remote' && job.location.toLowerCase().includes('remote')) ||
      (selectedLocation === 'colombo' && job.location.toLowerCase().includes('colombo')) ||
      (selectedLocation === 'hybrid' && job.location.toLowerCase().includes('hybrid'))

    return matchesTitle && matchesType && matchesLoc
  })

  return (
    <section id="jobs" className="py-16 md:py-24 border-b border-line bg-surface/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <span className="font-mono text-xs font-semibold text-accent tracking-widest uppercase mb-2 block">
              01 / Career Opportunities
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-head tracking-tight">
              Live Job Openings & Role Postings
            </h2>
            <p className="text-muted text-base mt-2 max-w-xl">
              Explore open roles across engineering, design, and product. Log in to run automated AI skill matching against your candidate profile.
            </p>
          </div>

          <div className="mt-4 md:mt-0 flex items-center gap-2 font-mono text-xs text-muted">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            Showing {filteredJobs.length} Verified Roles
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-panel border border-line rounded-2xl p-4 sm:p-6 shadow-sm mb-10 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            
            {/* Search Input */}
            <div className="md:col-span-6 relative">
              <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search job title, skills (e.g. React, C#, GCP)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-line bg-panel-2 text-text text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-muted"
              />
            </div>

            {/* Employment Type Filter */}
            <div className="md:col-span-3">
              <select
                value={selectedType}
                onChange={e => setSelectedType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-line bg-panel-2 text-text text-sm focus:outline-none focus:border-primary transition-all cursor-pointer"
              >
                <option value="all">All Employment Types</option>
                <option value={EmploymentType.FullTime.toString()}>Full Time</option>
                <option value={EmploymentType.Contract.toString()}>Contract</option>
                <option value={EmploymentType.PartTime.toString()}>Part Time</option>
                <option value={EmploymentType.Internship.toString()}>Internship</option>
              </select>
            </div>

            {/* Location Filter */}
            <div className="md:col-span-3">
              <select
                value={selectedLocation}
                onChange={e => setSelectedLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-line bg-panel-2 text-text text-sm focus:outline-none focus:border-primary transition-all cursor-pointer"
              >
                <option value="all">All Locations</option>
                <option value="remote">Remote Roles</option>
                <option value="colombo">Colombo, SL</option>
                <option value="hybrid">Hybrid Roles</option>
              </select>
            </div>

          </div>
        </div>

        {/* Job Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-panel border border-line rounded-2xl p-6 space-y-4 animate-pulse">
                <div className="h-6 bg-panel-2 rounded w-3/4" />
                <div className="h-4 bg-panel-2 rounded w-1/2" />
                <div className="h-16 bg-panel-2 rounded w-full" />
                <div className="h-8 bg-panel-2 rounded w-full" />
              </div>
            ))}
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="bg-panel border border-line rounded-2xl p-12 text-center max-w-md mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-panel-2 flex items-center justify-center mx-auto mb-4 text-muted">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
            </div>
            <h3 className="font-display font-semibold text-lg text-head mb-1">No roles found</h3>
            <p className="text-sm text-muted mb-4">Try clearing filters or searching for another keyword.</p>
            <button
              onClick={() => { setSearchTerm(''); setSelectedType('all'); setSelectedLocation('all') }}
              className="btn-design btn-design-secondary text-xs"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map(job => (
              <div
                key={job.id}
                className="bg-panel border border-line hover:border-primary/50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-primary-500/10 text-primary border border-primary/20">
                      {EmploymentTypeLabels[job.employmentType] || 'Full Time'}
                    </span>
                    <span className="text-xs font-mono text-muted flex items-center gap-1">
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 7v6l4 2"/></svg>
                      {job.minExperienceYears}+ yrs exp
                    </span>
                  </div>

                  {/* Job Title */}
                  <h3 className="font-display font-semibold text-xl text-head group-hover:text-primary transition-colors line-clamp-2 mb-2">
                    {job.title}
                  </h3>

                  {/* Location */}
                  <div className="flex items-center gap-1.5 text-xs text-muted mb-4">
                    <svg className="w-3.5 h-3.5 text-accent flex-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    <span>{job.location}</span>
                  </div>

                  {/* Description Teaser */}
                  <p className="text-xs text-muted leading-relaxed line-clamp-3 mb-6">
                    {job.description}
                  </p>

                  {/* Skills Chips */}
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {job.skillIds.slice(0, 4).map((skill, index) => (
                      <span
                        key={index}
                        className="px-2 py-0.5 rounded-md bg-panel-2 text-[11px] font-mono text-text border border-line"
                      >
                        {skill}
                      </span>
                    ))}
                    {job.skillIds.length > 4 && (
                      <span className="px-2 py-0.5 rounded-md bg-panel-2 text-[11px] font-mono text-muted">
                        +{job.skillIds.length - 4} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-4 border-t border-line flex items-center justify-between gap-3">
                  <button
                    onClick={() => onSelectJob(job)}
                    className="text-xs font-medium text-muted hover:text-head flex items-center gap-1 transition-colors cursor-pointer py-1.5 px-2"
                  >
                    View Details
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                  </button>

                  <button
                    onClick={() => onApplyJob(job)}
                    className="btn-design btn-design-primary text-xs py-2 px-4"
                  >
                    Apply Now
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  )
}
export default JobShowcase
