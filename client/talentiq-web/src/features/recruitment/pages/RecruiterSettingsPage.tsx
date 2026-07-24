import React, { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'

export const RecruiterSettingsPage: React.FC = () => {
  const { user } = useAuth()
  const toast = useToast()
  const [defaultCurrency, setDefaultCurrency] = useState('USD')
  const [defaultWorkMode, setDefaultWorkMode] = useState('Hybrid')
  const [autoPublishJobs, setAutoPublishJobs] = useState(true)
  const [aiMatchingThreshold, setAiMatchingThreshold] = useState(80)
  const [newAppEmailNotify, setNewAppEmailNotify] = useState(true)
  const [dailyDigest, setDailyDigest] = useState(true)
  const [meetingPlatform, setMeetingPlatform] = useState('GoogleMeet')
  const [defaultMeetingLink, setDefaultMeetingLink] = useState('https://meet.google.com/tiq-recruitment-default')

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success('Recruiter workspace settings updated successfully!')
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#001845] via-[#002855] to-[#7B2CBF] p-8 text-white shadow-xl border border-line">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white border border-white/20 mb-3">
              Recruiter Control Center
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">Recruiter Workspace Settings</h1>
            <p className="text-white/80 text-sm mt-1 max-w-xl">
              Configure default job posting parameters, AI matching sensitivity, notifications, and meeting integrations.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white text-lg font-bold">
              {user?.email?.[0]?.toUpperCase() ?? 'R'}
            </div>
            <div>
              <p className="text-sm font-bold text-white">{user?.email}</p>
              <p className="text-xs text-white/70">Recruiter Account</p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSaveSettings} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Job Posting Defaults */}
          <div className="bg-panel border border-line rounded-2xl p-6 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-head flex items-center gap-2 border-b border-line pb-4">
              <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Job Posting Defaults
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-text mb-1.5">Default Currency</label>
                <select
                  value={defaultCurrency}
                  onChange={(e) => setDefaultCurrency(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-line bg-panel-2 text-text text-xs focus:outline-none focus:border-accent cursor-pointer"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="LKR">LKR (Rs)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text mb-1.5">Default Work Mode</label>
                <select
                  value={defaultWorkMode}
                  onChange={(e) => setDefaultWorkMode(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-line bg-panel-2 text-text text-xs focus:outline-none focus:border-accent cursor-pointer"
                >
                  <option value="Hybrid">Hybrid</option>
                  <option value="Remote">Remote</option>
                  <option value="OnSite">On-site</option>
                </select>
              </div>
            </div>

            <label className="flex items-center justify-between p-4 rounded-xl border border-line bg-panel-2/50 hover:bg-panel-2 cursor-pointer transition-all">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-head block">Auto-Publish New Postings</span>
                <span className="text-[11px] text-muted block">Automatically set new job postings to Published status</span>
              </div>
              <input
                type="checkbox"
                checked={autoPublishJobs}
                onChange={(e) => setAutoPublishJobs(e.target.checked)}
                className="w-4 h-4 text-accent rounded border-line bg-panel-2"
              />
            </label>
          </div>

          {/* AI Match & Evaluation Thresholds */}
          <div className="bg-panel border border-line rounded-2xl p-6 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-head flex items-center gap-2 border-b border-line pb-4">
              <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              AI Matching & Talent Pool Scoring
            </h2>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold text-text">Recruiter Talent Match Sensitivity</label>
                <span className="text-xs font-bold text-accent bg-accent-subtle px-2.5 py-1 rounded-lg border border-accent/20">
                  {aiMatchingThreshold}% Minimum Overlap
                </span>
              </div>
              <input
                type="range"
                min="60"
                max="95"
                step="5"
                value={aiMatchingThreshold}
                onChange={(e) => setAiMatchingThreshold(Number(e.target.value))}
                className="w-full h-2 bg-panel-2 rounded-lg appearance-none cursor-pointer accent-accent"
              />
              <p className="text-[11px] text-muted mt-1">
                Candidates scoring below {aiMatchingThreshold}% match will be flagged for secondary review before shortlisting.
              </p>
            </div>
          </div>

          {/* Meeting Integration */}
          <div className="bg-panel border border-line rounded-2xl p-6 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-head flex items-center gap-2 border-b border-line pb-4">
              <svg className="w-5 h-5 text-m2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Interview Meeting Integration
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-text mb-1.5">Default Platform</label>
                <select
                  value={meetingPlatform}
                  onChange={(e) => setMeetingPlatform(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-line bg-panel-2 text-text text-xs focus:outline-none focus:border-accent cursor-pointer"
                >
                  <option value="GoogleMeet">Google Meet</option>
                  <option value="MicrosoftTeams">Microsoft Teams</option>
                  <option value="Zoom">Zoom Meetings</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text mb-1.5">Static Meeting Room Link</label>
                <input
                  type="text"
                  value={defaultMeetingLink}
                  onChange={(e) => setDefaultMeetingLink(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-line bg-panel-2 text-text text-xs focus:outline-none focus:border-accent"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Notifications */}
          <div className="bg-panel border border-line rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-head flex items-center gap-2 border-b border-line pb-3">
              <svg className="w-5 h-5 text-alert" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              Recruiter Notifications
            </h2>

            <label className="flex items-center justify-between p-3 rounded-xl border border-line bg-panel-2/40 hover:bg-panel-2 cursor-pointer transition-all">
              <span className="text-xs text-text">Instant Email on Application</span>
              <input
                type="checkbox"
                checked={newAppEmailNotify}
                onChange={(e) => setNewAppEmailNotify(e.target.checked)}
                className="w-4 h-4 text-accent rounded border-line"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl border border-line bg-panel-2/40 hover:bg-panel-2 cursor-pointer transition-all">
              <span className="text-xs text-text">Daily Recruitment Digest</span>
              <input
                type="checkbox"
                checked={dailyDigest}
                onChange={(e) => setDailyDigest(e.target.checked)}
                className="w-4 h-4 text-accent rounded border-line"
              />
            </label>

            <button
              type="submit"
              className="w-full py-3 bg-button-primary-bg text-button-primary-text text-xs font-bold rounded-xl shadow-md hover:brightness-110 transition-all mt-4 cursor-pointer"
            >
              Save Recruiter Settings
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
export default RecruiterSettingsPage
