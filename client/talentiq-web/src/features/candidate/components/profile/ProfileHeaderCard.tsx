import React from 'react'
import type { CandidateProfile } from '@/api/types'
import { env } from '@/lib/env'

interface ProfileHeaderCardProps {
  profile: CandidateProfile | null
  onAvatarUpload?: (file: File) => void
  onCoverUpload?: (file: File) => void
  isUploadingAvatar?: boolean
  isUploadingCover?: boolean
}

export const ProfileHeaderCard: React.FC<ProfileHeaderCardProps> = ({
  profile,
  onAvatarUpload,
  onCoverUpload,
  isUploadingAvatar = false,
  isUploadingCover = false,
}) => {
  if (!profile) return null

  const completion = profile.profileCompletionPercentage ?? 40

  const getFullImageUrl = (url?: string | null) => {
    if (!url) return null
    if (url.startsWith('http://') || url.startsWith('https://')) return url
    const baseUrl = env.API_BASE_URL || 'https://localhost:7001'
    return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`
  }

  const avatarUrl = getFullImageUrl(profile.profilePictureUrl) || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.preferredName || 'Candidate')}&background=7B2CBF&color=fff&size=128`
  const coverUrl = getFullImageUrl(profile.coverPictureUrl)

  return (
    <div className="rounded-2xl border border-line bg-panel shadow-md relative overflow-hidden text-left">
      {/* LinkedIn-Style Cover Banner Container */}
      <div className="relative h-44 sm:h-52 w-full bg-gradient-to-r from-accent/40 via-primary/30 to-purple-800/40 overflow-hidden">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt="LinkedIn Cover"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs font-mono font-bold text-white/50 bg-gradient-to-r from-purple-900/60 via-indigo-900/60 to-slate-900/60">
            🎨 TalentIQ Professional Banner
          </div>
        )}

        {/* Change Cover Photo Button (LinkedIn Style) */}
        <label className="absolute top-3 right-3 px-3 py-1.5 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md text-xs font-semibold text-white cursor-pointer transition-all flex items-center gap-1.5 border border-white/20 shadow-md">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
          <span>{isUploadingCover ? 'Uploading Cover...' : 'Edit Cover Banner'}</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && onCoverUpload?.(e.target.files[0])}
          />
        </label>
      </div>

      {/* Main Profile Info Section */}
      <div className="p-6 pt-0 relative flex flex-wrap items-end justify-between gap-6">
        <div className="flex flex-wrap items-end gap-5 -mt-14">
          {/* Avatar with Upload */}
          <div className="relative group">
            <img
              src={avatarUrl}
              alt="Profile Avatar"
              className="w-28 h-28 rounded-2xl object-cover border-4 border-panel shadow-2xl bg-surface"
            />
            <label className="absolute inset-0 rounded-2xl bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-[11px] font-bold text-white cursor-pointer transition-opacity">
              <svg className="w-6 h-6 mb-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              {isUploadingAvatar ? 'Uploading...' : 'Change Photo'}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && onAvatarUpload?.(e.target.files[0])}
              />
            </label>
          </div>

          <div className="space-y-1 pt-4 sm:pt-0">
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

        {/* Profile Strength Indicator */}
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
