import React, { useState } from 'react'
import type { CandidateProfile } from '@/api/types'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'

interface JobPreferencesSectionProps {
  profile: CandidateProfile
  onSave: (data: Partial<CandidateProfile>) => void
  isPending: boolean
}

export const JobPreferencesSection: React.FC<JobPreferencesSectionProps> = ({ profile, onSave, isPending }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState({
    preferredJobTitles: profile.preferredJobTitles || '',
    preferredLocations: profile.preferredLocations || '',
    expectedSalary: profile.expectedSalary || '',
    currency: profile.currency || 'USD',
    employmentTypePreference: profile.employmentTypePreference || 'Full Time',
    workMode: profile.workMode || 'Hybrid',
    noticePeriod: profile.noticePeriod || '30 Days',
    willingToRelocate: profile.willingToRelocate ?? true,
    openToOpportunities: profile.openToOpportunities ?? true,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      ...form,
      expectedSalary: form.expectedSalary ? Number(form.expectedSalary) : undefined,
    })
    setIsEditing(false)
  }

  const workModeOptions = [
    { value: 'Remote', label: 'Remote Only' },
    { value: 'Hybrid', label: 'Hybrid (Office + Remote)' },
    { value: 'On-site', label: 'On-site / In Office' },
  ]

  return (
    <div className="rounded-2xl border border-line bg-panel p-6 shadow-sm text-left">
      <div className="flex items-center justify-between border-b border-line pb-4 mb-4">
        <div>
          <h3 className="font-display text-base font-bold text-head flex items-center gap-2">
            ⚙️ Career & Job Preferences
          </h3>
          <p className="text-xs text-muted mt-0.5">Target roles, preferred locations, salary expectations, and work mode options.</p>
        </div>

        <button
          type="button"
          onClick={() => setIsEditing(!isEditing)}
          className="text-xs font-semibold text-accent hover:underline cursor-pointer"
        >
          {isEditing ? 'Cancel Edit' : 'Edit Preferences'}
        </button>
      </div>

      {!isEditing ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-panel-2/30 border border-line/60">
          <div>
            <span className="text-[11px] font-mono text-muted block">Target Roles</span>
            <span className="text-xs font-bold text-head">{profile.preferredJobTitles || 'Any Software Engineering'}</span>
          </div>
          <div>
            <span className="text-[11px] font-mono text-muted block">Preferred Locations</span>
            <span className="text-xs font-semibold text-head">{profile.preferredLocations || 'Remote / Hybrid'}</span>
          </div>
          <div>
            <span className="text-[11px] font-mono text-muted block">Expected Salary</span>
            <span className="text-xs font-semibold text-head">{profile.expectedSalary ? `${profile.expectedSalary.toLocaleString()} ${profile.currency}` : 'Negotiable'}</span>
          </div>
          <div>
            <span className="text-[11px] font-mono text-muted block">Work Mode</span>
            <span className="text-xs font-semibold text-head">{profile.workMode || 'Hybrid'}</span>
          </div>
          <div>
            <span className="text-[11px] font-mono text-muted block">Notice Period</span>
            <span className="text-xs font-semibold text-head">{profile.noticePeriod || '30 Days'}</span>
          </div>
          <div>
            <span className="text-[11px] font-mono text-muted block">Willing to Relocate</span>
            <span className="text-xs font-semibold text-head">{profile.willingToRelocate ? 'Yes ✓' : 'No'}</span>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Target Job Titles" value={form.preferredJobTitles} onChange={(e) => setForm({ ...form, preferredJobTitles: e.target.value })} placeholder="Frontend Architect, Fullstack Lead" />
            <Input label="Preferred Locations" value={form.preferredLocations} onChange={(e) => setForm({ ...form, preferredLocations: e.target.value })} placeholder="Remote, Colombo, Singapore" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input label="Expected Annual Salary" type="number" value={form.expectedSalary} onChange={(e) => setForm({ ...form, expectedSalary: e.target.value })} />
            <Input label="Currency" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} />
            <Select label="Work Mode" options={workModeOptions} value={form.workMode} onChange={(e) => setForm({ ...form, workMode: e.target.value })} />
          </div>

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-head cursor-pointer">
              <input type="checkbox" checked={form.willingToRelocate} onChange={(e) => setForm({ ...form, willingToRelocate: e.target.checked })} className="rounded text-accent focus:ring-accent" />
              Willing to Relocate
            </label>
            <label className="flex items-center gap-2 text-xs font-semibold text-head cursor-pointer">
              <input type="checkbox" checked={form.openToOpportunities} onChange={(e) => setForm({ ...form, openToOpportunities: e.target.checked })} className="rounded text-accent focus:ring-accent" />
              Open to New Opportunities
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
            <Button type="submit" variant="primary" isLoading={isPending}>Save Preferences</Button>
          </div>
        </form>
      )}
    </div>
  )
}

export default JobPreferencesSection
