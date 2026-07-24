import React, { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'

export const HiringManagerSettingsPage: React.FC = () => {
  const { user } = useAuth()
  const toast = useToast()
  const [techWeight, setTechWeight] = useState(40)
  const [behavWeight, setBehavWeight] = useState(30)
  const [cultWeight, setCultWeight] = useState(30)
  const [autoCalendarSync, setAutoCalendarSync] = useState(true)
  const [interviewReminderHours, setInterviewReminderHours] = useState(24)

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault()
    if (techWeight + behavWeight + cultWeight !== 100) {
      toast.error('Evaluation weights must sum to exactly 100%')
      return
    }
    toast.success('Hiring Manager criteria & settings updated successfully!')
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#001845] via-[#002855] to-[#fb7185] p-8 text-white shadow-xl border border-line">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white border border-white/20 mb-3">
              Hiring Manager Controls
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">Hiring Manager Settings</h1>
            <p className="text-white/80 text-sm mt-1 max-w-xl">
              Configure candidate evaluation score weighting, interview reminders, and Google Calendar sync defaults.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white text-lg font-bold">
              {user?.email?.[0]?.toUpperCase() ?? 'H'}
            </div>
            <div>
              <p className="text-sm font-bold text-white">{user?.email}</p>
              <p className="text-xs text-white/70">Hiring Manager Account</p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSaveSettings} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Evaluation Score Weights */}
          <div className="bg-panel border border-line rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div>
                <h2 className="text-lg font-bold text-head flex items-center gap-2">
                  <svg className="w-5 h-5 text-alert" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Candidate Evaluation Weighting
                </h2>
                <p className="text-xs text-muted mt-0.5">Set the criteria weights used when scoring candidate interviews</p>
              </div>
              <span className={`text-xs font-bold px-3 py-1 rounded-lg border ${
                techWeight + behavWeight + cultWeight === 100
                  ? 'bg-ok/10 text-ok border-ok/20'
                  : 'bg-alert/10 text-alert border-alert/20'
              }`}>
                Total: {techWeight + behavWeight + cultWeight}%
              </span>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-1.5 text-xs font-semibold text-text">
                  <span>Technical Competency Weight</span>
                  <span className="text-m2 font-bold">{techWeight}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="80"
                  step="5"
                  value={techWeight}
                  onChange={(e) => setTechWeight(Number(e.target.value))}
                  className="w-full h-2 bg-panel-2 rounded-lg appearance-none cursor-pointer accent-m2"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5 text-xs font-semibold text-text">
                  <span>Behavioral & Communication Weight</span>
                  <span className="text-accent font-bold">{behavWeight}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="80"
                  step="5"
                  value={behavWeight}
                  onChange={(e) => setBehavWeight(Number(e.target.value))}
                  className="w-full h-2 bg-panel-2 rounded-lg appearance-none cursor-pointer accent-accent"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5 text-xs font-semibold text-text">
                  <span>Cultural Fit & Problem Solving Weight</span>
                  <span className="text-alert font-bold">{cultWeight}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="80"
                  step="5"
                  value={cultWeight}
                  onChange={(e) => setCultWeight(Number(e.target.value))}
                  className="w-full h-2 bg-panel-2 rounded-lg appearance-none cursor-pointer accent-alert"
                />
              </div>
            </div>
          </div>

          {/* Calendar & Interview Reminders */}
          <div className="bg-panel border border-line rounded-2xl p-6 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-head flex items-center gap-2 border-b border-line pb-4">
              <svg className="w-5 h-5 text-m2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Calendar & Reminders
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-text mb-1.5">Interview Reminder Lead Time</label>
                <select
                  value={interviewReminderHours}
                  onChange={(e) => setInterviewReminderHours(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-line bg-panel-2 text-text text-xs focus:outline-none focus:border-accent cursor-pointer"
                >
                  <option value={12}>12 Hours Before</option>
                  <option value={24}>24 Hours Before (Default)</option>
                  <option value={48}>48 Hours Before</option>
                </select>
              </div>

              <div className="flex items-center">
                <label className="flex items-center justify-between w-full p-4 rounded-xl border border-line bg-panel-2/50 hover:bg-panel-2 cursor-pointer transition-all">
                  <span className="text-xs font-bold text-head">Google Calendar Auto-Sync</span>
                  <input
                    type="checkbox"
                    checked={autoCalendarSync}
                    onChange={(e) => setAutoCalendarSync(e.target.checked)}
                    className="w-4 h-4 text-alert rounded border-line"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-panel border border-line rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted">Action</h3>
            <button
              type="submit"
              className="w-full py-3 bg-button-primary-bg text-button-primary-text text-xs font-bold rounded-xl shadow-md hover:brightness-110 transition-all cursor-pointer"
            >
              Save Manager Settings
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
export default HiringManagerSettingsPage
