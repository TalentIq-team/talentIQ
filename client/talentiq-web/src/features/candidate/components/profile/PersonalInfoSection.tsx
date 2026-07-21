import React, { useState } from 'react'
import type { CandidateProfile } from '@/api/types'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

interface PersonalInfoSectionProps {
  profile: CandidateProfile
  onSave: (data: Partial<CandidateProfile>) => void
  isPending: boolean
}

export const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({ profile, onSave, isPending }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState({
    preferredName: profile.preferredName || '',
    gender: profile.gender || 'Prefer not to say',
    nationality: profile.nationality || '',
    address: profile.address || '',
    city: profile.city || '',
    country: profile.country || '',
    postalCode: profile.postalCode || '',
    timeZone: profile.timeZone || 'UTC+05:30',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(form)
    setIsEditing(false)
  }

  return (
    <div className="rounded-2xl border border-line bg-panel p-6 shadow-sm text-left">
      <div className="flex items-center justify-between border-b border-line pb-4 mb-4">
        <div>
          <h3 className="font-display text-base font-bold text-head flex items-center gap-2">
            👤 Personal & Contact Information
          </h3>
          <p className="text-xs text-muted mt-0.5">Manage your personal demographics, contact address, and location details.</p>
        </div>

        <button
          type="button"
          onClick={() => setIsEditing(!isEditing)}
          className="text-xs font-semibold text-accent hover:underline cursor-pointer"
        >
          {isEditing ? 'Cancel Edit' : 'Edit Details'}
        </button>
      </div>

      {!isEditing ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-panel-2/30 border border-line/60">
          <div>
            <span className="text-[11px] font-mono text-muted block">Preferred Name</span>
            <span className="text-xs font-bold text-head">{profile.preferredName || 'Not Set'}</span>
          </div>
          <div>
            <span className="text-[11px] font-mono text-muted block">Gender</span>
            <span className="text-xs font-semibold text-head">{profile.gender || 'Not Specified'}</span>
          </div>
          <div>
            <span className="text-[11px] font-mono text-muted block">Nationality</span>
            <span className="text-xs font-semibold text-head">{profile.nationality || 'Not Set'}</span>
          </div>
          <div>
            <span className="text-[11px] font-mono text-muted block">Time Zone</span>
            <span className="text-xs font-semibold text-head">{profile.timeZone || 'UTC+05:30'}</span>
          </div>
          <div className="sm:col-span-2">
            <span className="text-[11px] font-mono text-muted block">Address</span>
            <span className="text-xs font-semibold text-head">{profile.address || 'Not Set'}</span>
          </div>
          <div>
            <span className="text-[11px] font-mono text-muted block">City / Region</span>
            <span className="text-xs font-semibold text-head">{profile.city || 'Not Set'}</span>
          </div>
          <div>
            <span className="text-[11px] font-mono text-muted block">Country</span>
            <span className="text-xs font-semibold text-head">{profile.country || 'Not Set'}</span>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Preferred Name"
              value={form.preferredName}
              onChange={(e) => setForm({ ...form, preferredName: e.target.value })}
            />
            <Input
              label="Gender"
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
            />
            <Input
              label="Nationality"
              value={form.nationality}
              onChange={(e) => setForm({ ...form, nationality: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Input
              label="Address"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
            <Input
              label="City"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />
            <Input
              label="Country"
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
            />
            <Input
              label="Postal Code"
              value={form.postalCode}
              onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isPending}>
              Save Personal Info
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}

export default PersonalInfoSection
