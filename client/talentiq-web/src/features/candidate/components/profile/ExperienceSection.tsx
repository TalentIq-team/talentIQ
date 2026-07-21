import React, { useState } from 'react'
import type { CandidateExperience } from '@/api/types'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

interface ExperienceSectionProps {
  experiences?: CandidateExperience[]
  onAdd: (data: Omit<CandidateExperience, 'id'>) => void
  onDelete: (expId: string) => void
  isPending?: boolean
}

export const ExperienceSection: React.FC<ExperienceSectionProps> = ({ experiences = [], onAdd, onDelete, isPending }) => {
  const [showAddForm, setShowAddForm] = useState(false)
  const [company, setCompany] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [employmentType, setEmploymentType] = useState('Full-time')
  const [location, setLocation] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [currentlyWorking, setCurrentlyWorking] = useState(false)
  const [responsibilities, setResponsibilities] = useState('')
  const [achievements, setAchievements] = useState('')
  const [technologiesUsed, setTechnologiesUsed] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!company || !jobTitle || !startDate) return

    onAdd({
      company,
      jobTitle,
      employmentType,
      location,
      startDate: new Date(startDate).toISOString(),
      endDate: currentlyWorking || !endDate ? null : new Date(endDate).toISOString(),
      currentlyWorking,
      responsibilities,
      achievements,
      technologiesUsed,
    })

    setShowAddForm(false)
    setCompany('')
    setJobTitle('')
    setResponsibilities('')
  }

  return (
    <div className="rounded-2xl border border-line bg-panel p-6 shadow-sm text-left">
      <div className="flex items-center justify-between border-b border-line pb-4 mb-4">
        <div>
          <h3 className="font-display text-base font-bold text-head flex items-center gap-2">
            💼 Work Experience ({experiences.length})
          </h3>
          <p className="text-xs text-muted mt-0.5">Chronological employment history, key roles, responsibilities, and achievements.</p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-ai-accent text-xs px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 cursor-pointer"
        >
          <span>+</span> Add Experience
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="p-4 rounded-xl bg-panel-2/40 border border-line/60 space-y-4 mb-6 animate-fade-in">
          <h4 className="text-xs font-bold text-head uppercase tracking-wider">Add New Work Experience</h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Company Name" required value={company} onChange={(e) => setCompany(e.target.value)} />
            <Input label="Job Title" required value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
            <Input label="Employment Type" value={employmentType} onChange={(e) => setEmploymentType(e.target.value)} placeholder="Full-time, Contract, etc." />
            <Input label="Location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Remote / City" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
            <Input label="Start Date" type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            <Input label="End Date" type="date" disabled={currentlyWorking} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            <label className="flex items-center gap-2 text-xs font-semibold text-head cursor-pointer pt-4">
              <input type="checkbox" checked={currentlyWorking} onChange={(e) => setCurrentlyWorking(e.target.checked)} className="rounded text-accent focus:ring-accent" />
              I currently work here
            </label>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-head">Key Responsibilities & Deliverables</label>
            <textarea rows={3} value={responsibilities} onChange={(e) => setResponsibilities(e.target.value)} className="w-full rounded-xl border border-line bg-surface p-2.5 text-xs text-text focus:outline-none focus:ring-2 focus:ring-accent" placeholder="Built scalable React dashboards..." />
          </div>

          <Input label="Technologies Used" value={technologiesUsed} onChange={(e) => setTechnologiesUsed(e.target.value)} placeholder="e.g. React, C#, SQL Server, Docker" />

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
            <Button type="submit" variant="primary" isLoading={isPending}>Save Experience</Button>
          </div>
        </form>
      )}

      {experiences.length === 0 ? (
        <div className="text-center py-8 text-xs text-muted border border-dashed rounded-xl p-4">
          No work experiences added yet. Click <strong>+ Add Experience</strong> to document your career history.
        </div>
      ) : (
        <div className="relative border-l-2 border-line/60 ml-4 pl-6 space-y-6">
          {experiences.map((exp) => (
            <div key={exp.id} className="relative group">
              <span className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-accent border-4 border-panel" />

              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-head">{exp.jobTitle}</h4>
                  <p className="text-xs font-semibold text-accent">{exp.company} • {exp.employmentType}</p>
                  <p className="text-[11px] font-mono text-muted mt-0.5">
                    {new Date(exp.startDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })} – {exp.currentlyWorking ? 'Present' : exp.endDate ? new Date(exp.endDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : 'N/A'} {exp.location ? `• ${exp.location}` : ''}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onDelete(exp.id)}
                  className="text-xs text-red-400 opacity-0 group-hover:opacity-100 hover:underline transition-opacity cursor-pointer"
                >
                  Delete
                </button>
              </div>

              {exp.responsibilities && (
                <p className="text-xs text-text leading-relaxed mt-2 bg-panel-2/20 p-3 rounded-xl border border-line/40 whitespace-pre-line">
                  {exp.responsibilities}
                </p>
              )}

              {exp.technologiesUsed && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {exp.technologiesUsed.split(',').map((tech, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-mono font-medium">
                      {tech.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ExperienceSection
