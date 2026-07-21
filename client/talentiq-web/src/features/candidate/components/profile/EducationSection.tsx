import React, { useState } from 'react'
import type { CandidateEducation } from '@/api/types'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

interface EducationSectionProps {
  educations?: CandidateEducation[]
  onAdd: (data: Omit<CandidateEducation, 'id'>) => void
  onDelete: (eduId: string) => void
  isPending?: boolean
}

export const EducationSection: React.FC<EducationSectionProps> = ({ educations = [], onAdd, onDelete, isPending }) => {
  const [showAddForm, setShowAddForm] = useState(false)
  const [institution, setInstitution] = useState('')
  const [degree, setDegree] = useState('')
  const [fieldOfStudy, setFieldOfStudy] = useState('')
  const [gpa, setGpa] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!institution || !degree || !startDate) return

    onAdd({
      institution,
      degree,
      fieldOfStudy,
      gpa,
      startDate: new Date(startDate).toISOString(),
      endDate: endDate ? new Date(endDate).toISOString() : null,
      description,
    })

    setShowAddForm(false)
    setInstitution('')
    setDegree('')
  }

  return (
    <div className="rounded-2xl border border-line bg-panel p-6 shadow-sm text-left">
      <div className="flex items-center justify-between border-b border-line pb-4 mb-4">
        <div>
          <h3 className="font-display text-base font-bold text-head flex items-center gap-2">
            🎓 Education & Academic History ({educations.length})
          </h3>
          <p className="text-xs text-muted mt-0.5">Academic degrees, institutions, fields of study, and honors.</p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-ai-accent text-xs px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 cursor-pointer"
        >
          <span>+</span> Add Education
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="p-4 rounded-xl bg-panel-2/40 border border-line/60 space-y-4 mb-6 animate-fade-in">
          <h4 className="text-xs font-bold text-head uppercase tracking-wider">Add Education Qualification</h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Institution / University" required value={institution} onChange={(e) => setInstitution(e.target.value)} placeholder="e.g. NSBM Green University" />
            <Input label="Degree / Qualification" required value={degree} onChange={(e) => setDegree(e.target.value)} placeholder="e.g. B.Sc. (Hons) Software Engineering" />
            <Input label="Field of Study" value={fieldOfStudy} onChange={(e) => setFieldOfStudy(e.target.value)} placeholder="Computer Science / IT" />
            <Input label="GPA / Grade" value={gpa} onChange={(e) => setGpa(e.target.value)} placeholder="e.g. 3.8 / 4.0 First Class" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Start Date" type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            <Input label="End Date / Expected" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-head">Description & Academic Achievements</label>
            <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full rounded-xl border border-line bg-surface p-2.5 text-xs text-text focus:outline-none focus:ring-2 focus:ring-accent" placeholder="Specialized in Distributed Cloud Systems..." />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
            <Button type="submit" variant="primary" isLoading={isPending}>Save Education</Button>
          </div>
        </form>
      )}

      {educations.length === 0 ? (
        <div className="text-center py-8 text-xs text-muted border border-dashed rounded-xl p-4">
          No education details added yet. Click <strong>+ Add Education</strong> to add your degree.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {educations.map((edu) => (
            <div key={edu.id} className="p-4 rounded-xl bg-panel-2/30 border border-line/60 space-y-1.5 relative group">
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-xs font-bold text-head">{edu.degree}</h4>
                <button type="button" onClick={() => onDelete(edu.id)} className="text-xs text-red-400 opacity-0 group-hover:opacity-100 hover:underline transition-opacity cursor-pointer">Delete</button>
              </div>
              <p className="text-xs font-semibold text-accent">{edu.institution}</p>
              <p className="text-[11px] font-mono text-muted">
                {edu.fieldOfStudy ? `${edu.fieldOfStudy} • ` : ''}{new Date(edu.startDate).getFullYear()} – {edu.endDate ? new Date(edu.endDate).getFullYear() : 'Present'} {edu.gpa ? `• GPA: ${edu.gpa}` : ''}
              </p>
              {edu.description && <p className="text-xs text-text pt-1 border-t border-line/40">{edu.description}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default EducationSection
