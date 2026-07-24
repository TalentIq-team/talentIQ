import React, { useState } from 'react'
import type { CandidateProfile } from '@/api/types'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

interface SocialLinksSectionProps {
  profile: CandidateProfile
  onSave: (data: Partial<CandidateProfile>) => void
  isPending: boolean
}

export const SocialLinksSection: React.FC<SocialLinksSectionProps> = ({ profile, onSave, isPending }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState({
    linkedInUrl: profile.linkedInUrl || '',
    gitHubUrl: profile.gitHubUrl || '',
    portfolioUrl: profile.portfolioUrl || '',
    stackOverflowUrl: profile.stackOverflowUrl || '',
    behanceUrl: profile.behanceUrl || '',
    mediumUrl: profile.mediumUrl || '',
    twitterUrl: profile.twitterUrl || '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(form)
    setIsEditing(false)
  }

  const socialItems = [
    { label: 'LinkedIn', url: profile.linkedInUrl, icon: '💼' },
    { label: 'GitHub', url: profile.gitHubUrl, icon: '🐙' },
    { label: 'Portfolio', url: profile.portfolioUrl, icon: '🌐' },
    { label: 'StackOverflow', url: profile.stackOverflowUrl, icon: '🥞' },
    { label: 'Behance', url: profile.behanceUrl, icon: '🎨' },
    { label: 'Medium', url: profile.mediumUrl, icon: '✍️' },
    { label: 'Twitter / X', url: profile.twitterUrl, icon: '🐦' },
  ]

  return (
    <div className="rounded-2xl border border-line bg-panel p-6 shadow-sm text-left">
      <div className="flex items-center justify-between border-b border-line pb-4 mb-4">
        <div>
          <h3 className="font-display text-base font-bold text-head flex items-center gap-2">
            🌐 Professional Social Profiles & Portfolio Links
          </h3>
          <p className="text-xs text-muted mt-0.5">LinkedIn, GitHub, online portfolio, and developer community links.</p>
        </div>

        <button
          type="button"
          onClick={() => setIsEditing(!isEditing)}
          className="text-xs font-semibold text-accent hover:underline cursor-pointer"
        >
          {isEditing ? 'Cancel Edit' : 'Edit Links'}
        </button>
      </div>

      {!isEditing ? (
        <div className="flex flex-wrap gap-3">
          {socialItems.filter(s => s.url).length === 0 ? (
            <span className="text-xs text-muted italic">No social profile links added yet.</span>
          ) : (
            socialItems.filter(s => s.url).map((item) => (
              <a
                key={item.label}
                href={item.url!}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-2 rounded-xl bg-panel-2/60 border border-line hover:border-accent text-xs font-semibold text-head flex items-center gap-2 transition-colors"
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
                <span className="text-muted text-[10px]">↗</span>
              </a>
            ))
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="LinkedIn URL" value={form.linkedInUrl} onChange={(e) => setForm({ ...form, linkedInUrl: e.target.value })} placeholder="https://linkedin.com/in/..." />
            <Input label="GitHub URL" value={form.gitHubUrl} onChange={(e) => setForm({ ...form, gitHubUrl: e.target.value })} placeholder="https://github.com/..." />
            <Input label="Portfolio Website" value={form.portfolioUrl} onChange={(e) => setForm({ ...form, portfolioUrl: e.target.value })} placeholder="https://yourname.dev" />
            <Input label="StackOverflow URL" value={form.stackOverflowUrl} onChange={(e) => setForm({ ...form, stackOverflowUrl: e.target.value })} />
            <Input label="Behance / Dribbble" value={form.behanceUrl} onChange={(e) => setForm({ ...form, behanceUrl: e.target.value })} />
            <Input label="Medium / Blog" value={form.mediumUrl} onChange={(e) => setForm({ ...form, mediumUrl: e.target.value })} />
            <Input label="Twitter / X" value={form.twitterUrl} onChange={(e) => setForm({ ...form, twitterUrl: e.target.value })} />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
            <Button type="submit" variant="primary" isLoading={isPending}>Save Social Links</Button>
          </div>
        </form>
      )}
    </div>
  )
}

export default SocialLinksSection
