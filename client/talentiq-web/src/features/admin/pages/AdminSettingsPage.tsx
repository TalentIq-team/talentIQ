import React, { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'

export const AdminSettingsPage: React.FC = () => {
  const { user } = useAuth()
  const toast = useToast()
  const [platformName, setPlatformName] = useState('TalentIQ Global')
  const [orgName, setOrgName] = useState('TalentIQ Enterprise')
  const [geminiModel, setGeminiModel] = useState('gemini-2.0-flash')
  const [enableDevBypass, setEnableDevBypass] = useState(true)
  const [auditLogRetentionDays, setAuditLogRetentionDays] = useState(90)
  const [maxLoginAttempts, setMaxLoginAttempts] = useState(5)
  const [sessionTimeoutMinutes, setSessionTimeoutMinutes] = useState(60)

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success('System Administrator settings updated successfully!')
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#001845] via-[#002855] to-[#7B2CBF] p-8 text-white shadow-xl border border-line">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white border border-white/20 mb-3">
              System Governance
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">System Settings & Governance</h1>
            <p className="text-white/80 text-sm mt-1 max-w-xl">
              Configure global system parameters, AI Gemini model selection, security controls, and audit log policies.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white text-lg font-bold">
              {user?.email?.[0]?.toUpperCase() ?? 'A'}
            </div>
            <div>
              <p className="text-sm font-bold text-white">{user?.email}</p>
              <p className="text-xs text-white/70">System Administrator</p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSaveSettings} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* General Platform Config */}
          <div className="bg-panel border border-line rounded-2xl p-6 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-head flex items-center gap-2 border-b border-line pb-4">
              <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              General Organization & Platform Identity
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-text mb-1.5">Platform Title</label>
                <input
                  type="text"
                  value={platformName}
                  onChange={(e) => setPlatformName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-line bg-panel-2 text-text text-xs focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text mb-1.5">Enterprise Organization</label>
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-line bg-panel-2 text-text text-xs focus:outline-none focus:border-accent"
                />
              </div>
            </div>
          </div>

          {/* AI Gemini Model Config */}
          <div className="bg-panel border border-line rounded-2xl p-6 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-head flex items-center gap-2 border-b border-line pb-4">
              <svg className="w-5 h-5 text-m2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              AI Engine & LLM Configuration (Gemini API)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-text mb-1.5">Primary Gemini LLM Model</label>
                <select
                  value={geminiModel}
                  onChange={(e) => setGeminiModel(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-line bg-panel-2 text-text text-xs focus:outline-none focus:border-accent cursor-pointer"
                >
                  <option value="gemini-2.0-flash">Gemini 2.0 Flash (Recommended - Ultra Fast)</option>
                  <option value="gemini-1.5-pro">Gemini 1.5 Pro (Deep Analysis)</option>
                  <option value="deterministic-fallback">Deterministic Skill Matching Fallback</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text mb-1.5">Audit Log Retention (Days)</label>
                <input
                  type="number"
                  value={auditLogRetentionDays}
                  onChange={(e) => setAuditLogRetentionDays(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-line bg-panel-2 text-text text-xs focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            <label className="flex items-center justify-between p-4 rounded-xl border border-line bg-panel-2/50 hover:bg-panel-2 cursor-pointer transition-all">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-head block">Dev Mode Bypass Accounts</span>
                <span className="text-[11px] text-muted block">Allow instant login for candidate, recruiter, manager, and admin dev accounts</span>
              </div>
              <input
                type="checkbox"
                checked={enableDevBypass}
                onChange={(e) => setEnableDevBypass(e.target.checked)}
                className="w-4 h-4 text-accent rounded border-line bg-panel-2"
              />
            </label>
          </div>

          {/* Security & Access Policies */}
          <div className="bg-panel border border-line rounded-2xl p-6 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-head flex items-center gap-2 border-b border-line pb-4">
              <svg className="w-5 h-5 text-alert" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Security Policy Controls
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-text mb-1.5">Max Failed Login Attempts</label>
                <input
                  type="number"
                  value={maxLoginAttempts}
                  onChange={(e) => setMaxLoginAttempts(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-line bg-panel-2 text-text text-xs focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text mb-1.5">JWT Session Timeout (Minutes)</label>
                <input
                  type="number"
                  value={sessionTimeoutMinutes}
                  onChange={(e) => setSessionTimeoutMinutes(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-line bg-panel-2 text-text text-xs focus:outline-none focus:border-accent"
                />
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
              Save Admin Settings
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
export default AdminSettingsPage
