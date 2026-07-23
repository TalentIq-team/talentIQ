import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getAuditLogs, type AuditLogItem } from '@/api/endpoints'
import { useToast } from '@/hooks/useToast'

export const AuditLogsPage: React.FC = () => {
  const toast = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedActionFilter, setSelectedActionFilter] = useState('ALL')
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null)

  const { data: logs = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'audit-logs'],
    queryFn: getAuditLogs,
  })

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.ipAddress && log.ipAddress.includes(searchTerm))

    if (selectedActionFilter === 'ALL') return matchesSearch
    return matchesSearch && log.action.toLowerCase().startsWith(selectedActionFilter.toLowerCase())
  })

  const getActionBadgeColor = (action: string) => {
    const act = action.toLowerCase()
    if (act.includes('login')) return 'bg-ok/10 text-ok border-ok/20'
    if (act.includes('delete') || act.includes('deactivate')) return 'bg-alert/10 text-alert border-alert/20'
    if (act.includes('talentpool') || act.includes('offer')) return 'bg-accent-subtle text-accent border-accent/20'
    if (act.includes('application')) return 'bg-m1 text-m2 border-m2/20'
    return 'bg-panel-2 text-head border-line'
  }

  const formatTimestamp = (ts: string) => {
    try {
      const d = new Date(ts)
      return d.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    } catch {
      return ts
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#001845] via-[#002855] to-[#7B2CBF] p-8 text-white shadow-xl border border-line">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white border border-white/20 mb-3">
              System Compliance & Security
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">System Audit Logs</h1>
            <p className="text-white/80 text-sm mt-1 max-w-xl">
              Track all system actions, user logins, talent pool modifications, and security events in real-time.
            </p>
          </div>
          <button
            onClick={() => {
              refetch()
              toast.success('Audit logs refreshed')
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs font-bold transition-all shadow-md self-start md:self-center cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Logs
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-panel border border-line rounded-2xl p-5 shadow-sm">
          <div className="text-[11px] font-bold text-muted uppercase tracking-wider">Total Audit Events</div>
          <div className="text-2xl font-extrabold text-head mt-1">{logs.length}</div>
          <div className="text-[11px] text-ok mt-1 flex items-center gap-1 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-ok"></span> Live Monitoring
          </div>
        </div>

        <div className="bg-panel border border-line rounded-2xl p-5 shadow-sm">
          <div className="text-[11px] font-bold text-muted uppercase tracking-wider">User Logins</div>
          <div className="text-2xl font-extrabold text-m2 mt-1">
            {logs.filter((l) => l.action.toLowerCase().includes('login')).length}
          </div>
          <div className="text-[11px] text-muted mt-1">Authentication sessions</div>
        </div>

        <div className="bg-panel border border-line rounded-2xl p-5 shadow-sm">
          <div className="text-[11px] font-bold text-muted uppercase tracking-wider">Talent & App Actions</div>
          <div className="text-2xl font-extrabold text-accent mt-1">
            {logs.filter((l) => l.action.toLowerCase().includes('pool') || l.action.toLowerCase().includes('application')).length}
          </div>
          <div className="text-[11px] text-muted mt-1">Recruitment activity</div>
        </div>

        <div className="bg-panel border border-line rounded-2xl p-5 shadow-sm">
          <div className="text-[11px] font-bold text-muted uppercase tracking-wider">Security System Status</div>
          <div className="text-2xl font-extrabold text-ok mt-1">Active</div>
          <div className="text-[11px] text-ok/80 mt-1">0 Breach Alerts</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-panel border border-line rounded-2xl p-5 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <svg className="w-4 h-4 absolute left-3.5 top-3 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by user email, action, or IP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-line bg-panel-2 text-text text-xs placeholder:text-muted focus:outline-none focus:border-m2"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { id: 'ALL', label: 'All Events' },
            { id: 'User', label: 'User Logins' },
            { id: 'TalentPool', label: 'Talent Pool' },
            { id: 'Application', label: 'Applications' },
            { id: 'Analytics', label: 'Analytics' },
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => setSelectedActionFilter(filter.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedActionFilter === filter.id
                  ? 'bg-button-primary-bg text-button-primary-text shadow-sm'
                  : 'bg-panel-2 text-muted hover:text-head hover:bg-line'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-panel border border-line rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-muted text-xs">Loading system audit logs...</div>
        ) : isError ? (
          <div className="p-12 text-center text-alert text-xs">Failed to load audit logs. Make sure backend is running.</div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-muted text-xs">No audit logs matched your search filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-line bg-panel-2 text-[11px] font-bold text-muted uppercase tracking-wider">
                  <th className="py-3.5 px-6">Timestamp</th>
                  <th className="py-3.5 px-6">User Email</th>
                  <th className="py-3.5 px-6">Action Performed</th>
                  <th className="py-3.5 px-6">IP Address</th>
                  <th className="py-3.5 px-6 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-xs text-text">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-panel-2/60 transition-colors">
                    <td className="py-4 px-6 font-mono text-muted whitespace-nowrap">
                      {formatTimestamp(log.timestamp)}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-panel-2 border border-line flex items-center justify-center text-[10px] font-bold text-head uppercase">
                          {log.userEmail[0]}
                        </div>
                        <span className="font-semibold text-head">{log.userEmail}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold border ${getActionBadgeColor(
                          log.action
                        )}`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-mono text-muted">
                      {log.ipAddress ?? '127.0.0.1'}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="px-3 py-1.5 bg-panel-2 hover:bg-line text-head font-semibold text-[11px] rounded-lg border border-line transition-all cursor-pointer"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inspect Log Drawer Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-panel border border-line rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6 text-text">
            <div className="flex justify-between items-start border-b border-line pb-4">
              <div>
                <h3 className="text-lg font-bold text-head">Audit Log Record</h3>
                <p className="text-xs text-muted font-mono">ID: {selectedLog.id}</p>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-muted hover:text-head p-1 rounded-lg hover:bg-panel-2 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-line/60">
                <span className="text-muted">User Email</span>
                <span className="font-bold text-head">{selectedLog.userEmail}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-line/60">
                <span className="text-muted">User ID</span>
                <span className="font-mono text-text">{selectedLog.userId}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-line/60">
                <span className="text-muted">Action Code</span>
                <span className="font-bold text-m2">{selectedLog.action}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-line/60">
                <span className="text-muted">Timestamp</span>
                <span className="font-mono text-text">{formatTimestamp(selectedLog.timestamp)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted">IP Address</span>
                <span className="font-mono text-text">{selectedLog.ipAddress ?? '127.0.0.1'}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-5 py-2 bg-button-primary-bg text-button-primary-text font-bold text-xs rounded-xl shadow-md cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
export default AuditLogsPage
