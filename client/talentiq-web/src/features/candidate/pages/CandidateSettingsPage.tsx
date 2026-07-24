import React, { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'

export const CandidateSettingsPage: React.FC = () => {
  const { user } = useAuth()
  const toast = useToast()
  const [profileVisibility, setProfileVisibility] = useState('RecruitersOnly')
  const [emailDigest, setEmailDigest] = useState(true)
  const [smsAlerts, setSmsAlerts] = useState(false)
  const [matchThreshold, setMatchThreshold] = useState(75)
  const [talentPoolConsent, setTalentPoolConsent] = useState(true)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success('Candidate settings saved successfully!')
  }

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentPassword || !newPassword) {
      toast.error('Please fill in all password fields.')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match.')
      return
    }
    toast.success('Password updated successfully!')
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#001845] via-[#002855] to-[#0353A4] p-8 text-white shadow-xl border border-line">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white border border-white/20 mb-3">
              Candidate Preferences
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">Candidate Settings</h1>
            <p className="text-white/80 text-sm mt-1 max-w-xl">
              Manage your job search preferences, profile visibility, notifications, and security options.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white text-lg font-bold">
              {user?.email?.[0]?.toUpperCase() ?? 'C'}
            </div>
            <div>
              <p className="text-sm font-bold text-white">{user?.email}</p>
              <p className="text-xs text-white/70">Candidate Account</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Settings Form */}
        <div className="lg:col-span-2 space-y-8">
          {/* Job Search & Match Settings */}
          <div className="bg-panel border border-line rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div>
                <h2 className="text-lg font-bold text-head flex items-center gap-2">
                  <svg className="w-5 h-5 text-m2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  AI Match & Alert Preferences
                </h2>
                <p className="text-xs text-muted mt-0.5">Customize minimum AI match scores for recommendations</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-semibold text-text">Minimum AI Match Threshold</label>
                  <span className="text-xs font-bold text-m2 bg-m1 px-2.5 py-1 rounded-lg border border-m2/20">
                    {matchThreshold}% Match Score
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="95"
                  step="5"
                  value={matchThreshold}
                  onChange={(e) => setMatchThreshold(Number(e.target.value))}
                  className="w-full h-2 bg-panel-2 rounded-lg appearance-none cursor-pointer accent-m2"
                />
                <p className="text-[11px] text-muted mt-1">
                  Only show job postings with an AI skill overlap match of {matchThreshold}% or higher.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <label className="flex items-center justify-between p-4 rounded-xl border border-line bg-panel-2/50 hover:bg-panel-2 cursor-pointer transition-all">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-head block">Email Job Digest</span>
                    <span className="text-[11px] text-muted block">Receive weekly AI job recommendations</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailDigest}
                    onChange={(e) => setEmailDigest(e.target.checked)}
                    className="w-4 h-4 text-m2 rounded border-line bg-panel-2"
                  />
                </label>

                <label className="flex items-center justify-between p-4 rounded-xl border border-line bg-panel-2/50 hover:bg-panel-2 cursor-pointer transition-all">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-head block">SMS Interview Alerts</span>
                    <span className="text-[11px] text-muted block">Get instant SMS when invited to interview</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={smsAlerts}
                    onChange={(e) => setSmsAlerts(e.target.checked)}
                    className="w-4 h-4 text-m2 rounded border-line bg-panel-2"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Privacy & Talent Pool Settings */}
          <div className="bg-panel border border-line rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div>
                <h2 className="text-lg font-bold text-head flex items-center gap-2">
                  <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Privacy & Profile Visibility
                </h2>
                <p className="text-xs text-muted mt-0.5">Control who can discover your candidate profile</p>
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-xs font-semibold text-text">Profile Visibility Scope</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'Public', title: 'Public', desc: 'Visible to all recruiters and employers' },
                  { id: 'RecruitersOnly', title: 'Recruiters Only', desc: 'Only verified TalentIQ recruiters' },
                  { id: 'Private', title: 'Private', desc: 'Hidden until you apply to a position' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setProfileVisibility(opt.id)}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                      profileVisibility === opt.id
                        ? 'border-m2 bg-m1 text-head font-bold shadow-sm'
                        : 'border-line bg-panel-2/40 text-muted hover:bg-panel-2'
                    }`}
                  >
                    <div className="text-xs font-bold text-head mb-1">{opt.title}</div>
                    <div className="text-[10px] text-muted leading-snug">{opt.desc}</div>
                  </button>
                ))}
              </div>

              <div className="pt-2">
                <label className="flex items-center justify-between p-4 rounded-xl border border-line bg-panel-2/50 hover:bg-panel-2 cursor-pointer transition-all">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-head block">Talent Pool Consent</span>
                    <span className="text-[11px] text-muted block">
                      Allow recruiters to keep your profile in talent pool for future opportunities
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={talentPoolConsent}
                    onChange={(e) => setTalentPoolConsent(e.target.checked)}
                    className="w-4 h-4 text-m2 rounded border-line bg-panel-2"
                  />
                </label>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleSavePreferences}
                className="px-6 py-2.5 bg-button-primary-bg text-button-primary-text text-xs font-bold rounded-xl hover:brightness-110 transition-all shadow-sm cursor-pointer"
              >
                Save Candidate Settings
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Security Column */}
        <div className="space-y-8">
          {/* Security & Password */}
          <form onSubmit={handleChangePassword} className="bg-panel border border-line rounded-2xl p-6 shadow-sm space-y-5">
            <h2 className="text-base font-bold text-head flex items-center gap-2 border-b border-line pb-3">
              <svg className="w-5 h-5 text-alert" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              Security Settings
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text mb-1.5">Current Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-line bg-panel-2 text-text text-xs placeholder:text-muted focus:outline-none focus:border-m2"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text mb-1.5">New Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-line bg-panel-2 text-text text-xs placeholder:text-muted focus:outline-none focus:border-m2"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text mb-1.5">Confirm New Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-line bg-panel-2 text-text text-xs placeholder:text-muted focus:outline-none focus:border-m2"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-panel-2 hover:bg-line text-head text-xs font-bold rounded-xl border border-line transition-all cursor-pointer"
            >
              Update Password
            </button>
          </form>

          {/* Account Status Card */}
          <div className="bg-panel border border-line rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted">Account Information</h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-line">
                <span className="text-muted">Account Type</span>
                <span className="font-bold text-m2">Candidate Account</span>
              </div>
              <div className="flex justify-between py-2 border-b border-line">
                <span className="text-muted">Status</span>
                <span className="font-bold text-ok">Active</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted">Registered Email</span>
                <span className="font-semibold text-head truncate max-w-[140px]">{user?.email}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default CandidateSettingsPage
