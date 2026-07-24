import React, { useState } from 'react'
import type { CandidateProfile } from '@/api/types'
import Button from '@/components/ui/Button'

interface PrivacySettingsSectionProps {
  profile: CandidateProfile
  onSave: (data: Partial<CandidateProfile>) => void
  isPending: boolean
}

export const PrivacySettingsSection: React.FC<PrivacySettingsSectionProps> = ({ profile, onSave, isPending }) => {
  const [form, setForm] = useState({
    allowRecruiterSearch: profile.allowRecruiterSearch ?? true,
    showEmail: profile.showEmail ?? true,
    showPhone: profile.showPhone ?? true,
    showResume: profile.showResume ?? true,
    receiveEmails: profile.receiveEmails ?? true,
    receiveSms: profile.receiveSms ?? false,
    talentPoolConsent: profile.talentPoolConsent ?? true,
    allowAiAnalysis: profile.allowAiAnalysis ?? true,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(form)
  }

  const toggles = [
    { key: 'allowRecruiterSearch', label: 'Allow Recruiters to Find My Profile in Talent Searches', desc: 'Recruiters can discover your profile when matching candidate criteria.' },
    { key: 'talentPoolConsent', label: 'Talent Pool Inclusion Consent', desc: 'Allow enterprise hiring teams to store your details in talent matching pools.' },
    { key: 'allowAiAnalysis', label: 'Gemini AI Resume & Match Analysis Consent', desc: 'Enable AI evaluation of your profile against job descriptions.' },
    { key: 'showEmail', label: 'Display Email Address to Recruiters', desc: 'Verified recruiters can view your contact email.' },
    { key: 'showPhone', label: 'Display Phone Number to Recruiters', desc: 'Verified recruiters can view your phone contact.' },
    { key: 'receiveEmails', label: 'Receive Job Matching Alerts via Email', desc: 'Get automated updates on new jobs matching your profile.' },
  ]

  return (
    <div className="rounded-2xl border border-line bg-panel p-6 shadow-sm text-left">
      <div className="border-b border-line pb-4 mb-4">
        <h3 className="font-display text-base font-bold text-head flex items-center gap-2">
          🔒 Privacy, Security & AI Consents
        </h3>
        <p className="text-xs text-muted mt-0.5">Control recruiter searchability, contact visibility, and Gemini AI analysis consents.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-3">
          {toggles.map((item) => (
            <div key={item.key} className="flex items-start justify-between gap-4 p-3.5 rounded-xl bg-panel-2/20 border border-line/40">
              <div>
                <h4 className="text-xs font-bold text-head">{item.label}</h4>
                <p className="text-[11px] text-muted">{item.desc}</p>
              </div>

              <input
                type="checkbox"
                checked={(form as any)[item.key]}
                onChange={(e) => setForm({ ...form, [item.key]: e.target.checked })}
                className="w-4 h-4 rounded text-accent focus:ring-accent cursor-pointer mt-1"
              />
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-2">
          <Button type="submit" variant="primary" isLoading={isPending}>
            Save Privacy Settings
          </Button>
        </div>
      </form>
    </div>
  )
}

export default PrivacySettingsSection
