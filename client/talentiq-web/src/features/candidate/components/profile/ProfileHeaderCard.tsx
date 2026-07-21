import React from 'react'
import type { CandidateProfile } from '@/api/types'

interface ProfileHeaderCardProps {
  profile: CandidateProfile | null
  onAvatarUpload?: (file: File) => void
}

export const ProfileHeaderCard: React.FC<ProfileHeaderCardProps> = ({ profile, onAvatarUpload }) => {
  if (!profile) return null

  const completion = profile.profileCompletionPercentage ?? 40
  const avatarUrl = profile.profilePictureUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.preferredName || 'Candidate')}&background=7B2CBF&color=fff&size=128`

  return (
    <div className="rounded-2xl border border-line bg-panel p-6 shadow-md relative overflow-hidden text-left">
      {/* Background Banner Accent */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-accent/30 via-primary/20 to-purple-600/20" />

      <div className="relative pt-8 flex flex-wrap items-end justify-between gap-6">
        <div className="flex flex-wrap items-end gap-5">
          {/* Avatar with Upload */}
          <div className="relative group">
            <img
              src={avatarUrl}
              alt="Profile"
              className="w-24 h-24 rounded-2xl object-cover border-4 border-panel shadow-lg bg-surface"
            />
            <label className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-[10px] font-bold text-white cursor-pointer transition-opacity">
              <svg className="w-5 h-5 mb-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              Upload
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && onAvatarUpload?.(e.target.files[0])}
              />
            </label>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black text-head tracking-tight">
                {profile.preferredName || 'Candidate Profile'}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {profile.openToOpportunities ? 'Open to Opportunities' : 'Not Looking'}
              </span>
            </div>

            <p className="text-sm font-semibold text-accent">
              {profile.headline || profile.currentJobTitle || 'Software Professional'} {profile.currentCompany ? `at ${profile.currentCompany}` : ''}
            </p>

            <div className="flex flex-wrap items-center gap-3 text-xs text-muted font-mono pt-1">
              <span>📍 {profile.city || profile.country || 'Location Not Set'}</span>
              <span>•</span>
              <span>💼 {profile.yearsOfExperience} Yrs Experience</span>
              <span>•</span>
              <span>⏱️ Notice: {profile.noticePeriod || '30 Days'}</span>
            </div>
          </div>
        </div>

        {/* Completion Score Meter */}
        <div className="flex items-center gap-3 bg-panel-2/60 border border-line p-3.5 rounded-xl">
          <div className="relative w-12 h-12 flex items-center justify-center">
            <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-line"
                strokeWidth="3"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-accent"
                strokeDasharray={`${completion}, 100`}
                strokeWidth="3"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-xs font-bold font-mono text-head">{completion}%</span>
          </div>
          <div>
            <span className="text-[11px] font-mono font-bold text-head uppercase block">Profile Strength</span>
            <span className="text-[11px] text-muted block">
              {completion >= 85 ? '🌟 All Star Profile' : completion >= 60 ? '👍 Strong Profile' : '⚠️ Action Needed'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileHeaderCard
