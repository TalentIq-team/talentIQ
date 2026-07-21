import React, { useState } from 'react'
import type { CandidateProfile } from '@/api/types'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

interface ProfessionalInfoSectionProps {
  profile: CandidateProfile
  onSave: (data: Partial<CandidateProfile>) => void
  isPending: boolean
}

export const ProfessionalInfoSection: React.FC<ProfessionalInfoSectionProps> = ({ profile, onSave, isPending }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [headline, setHeadline] = useState(profile.headline || '')
  const [currentJobTitle, setCurrentJobTitle] = useState(profile.currentJobTitle || '')
  const [currentCompany, setCurrentCompany] = useState(profile.currentCompany || '')
  const [summary, setSummary] = useState(profile.professionalSummary || '')
  const [years, setYears] = useState(profile.yearsOfExperience || 0)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      headline,
      currentJobTitle,
      currentCompany,
      professionalSummary: summary,
      yearsOfExperience: Number(years),
    })
    setIsEditing(false)
  }

  return (
    <div className="rounded-2xl border border-line bg-panel p-6 shadow-sm text-left">
      <div className="flex items-center justify-between border-b border-line pb-4 mb-4">
        <div>
          <h3 className="font-display text-base font-bold text-head flex items-center gap-2">
            🎯 Professional Headline & Summary
          </h3>
          <p className="text-xs text-muted mt-0.5">Define your current title, total experience, and elevator pitch for recruiters.</p>
        </div>

        <button
          type="button"
          onClick={() => setIsEditing(!isEditing)}
          className="text-xs font-semibold text-accent hover:underline cursor-pointer"
        >
          {isEditing ? 'Cancel Edit' : 'Edit Section'}
        </button>
      </div>

      {!isEditing ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-panel-2/30 border border-line/60">
            <div>
              <span className="text-[11px] font-mono text-muted block">Headline</span>
              <span className="text-xs font-bold text-head">{profile.headline || 'Not Set'}</span>
            </div>
            <div>
              <span className="text-[11px] font-mono text-muted block">Current Role</span>
              <span className="text-xs font-semibold text-head">{profile.currentJobTitle || 'Not Set'}</span>
            </div>
            <div>
              <span className="text-[11px] font-mono text-muted block">Current Employer</span>
              <span className="text-xs font-semibold text-head">{profile.currentCompany || 'Not Set'}</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-mono font-bold text-muted uppercase tracking-wider mb-1.5">Executive Summary</h4>
            <p className="text-xs text-text leading-relaxed bg-panel-2/20 p-4 rounded-xl border border-line/40 whitespace-pre-line">
              {profile.professionalSummary || 'No professional summary added.'}
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Professional Headline"
            placeholder="e.g. Senior Frontend Architect | React 19 & TypeScript Enthusiast"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Current Job Title"
              placeholder="e.g. Senior Software Engineer"
              value={currentJobTitle}
              onChange={(e) => setCurrentJobTitle(e.target.value)}
            />
            <Input
              label="Current Company"
              placeholder="e.g. Acme Tech Solutions"
              value={currentCompany}
              onChange={(e) => setCurrentCompany(e.target.value)}
            />
            <Input
              label="Years of Experience"
              type="number"
              min={0}
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-head">Professional Summary</label>
            <textarea
              rows={4}
              required
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full rounded-xl border border-line bg-surface p-3 text-xs text-text focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="Summarize your core engineering background, key technical achievements, and career aspirations..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isPending}>
              Save Professional Info
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}

export default ProfessionalInfoSection
