import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient, toErrorMessage } from '@/lib/api'
import { Spinner, ErrorBanner, EmptyState } from '@/components/Feedback'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'

interface TalentPoolEntry {
  id: string
  candidateProfileId: string
  consentStatus: number // 1 = Pending, 2 = Accepted, 3 = Declined, 4 = Expired, 5 = Withdrawn
  isActive: boolean
  createdAt: string
  consentExpiryDate: string | null
  skillTags: string
}

interface ReportResult {
  profileStrength: string
  skillsGainedJson: string
  resumeFreshnessStatus: string
  recommendation: string
}

interface JobPosting {
  id: string
  title: string
  status: number
}

export const TalentPoolDashboardPage: React.FC = () => {
  const queryClient = useQueryClient()
  const [filterSkills, setFilterSkills] = useState('')
  
  // Selection states for re-engagement
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null)
  const [selectedReportEntryId, setSelectedReportEntryId] = useState<string | null>(null)
  const [targetJobId, setTargetJobId] = useState('')
  const [msg, setMsg] = useState<string | null>(null)

  // Query talent pool entries
  const { data: entries = [], isLoading, isError, error } = useQuery<TalentPoolEntry[]>({
    queryKey: ['talent-pool-entries'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/v1/talent-pool/dashboard')
      return data
    },
  })

  // Query open jobs for re-engagement
  const { data: jobs = [] } = useQuery<JobPosting[]>({
    queryKey: ['reengage-jobs'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/v1/jobs')
      return (data || []).filter((j: any) => j.status === 2) // Published only
    },
  })

  // Query monthly report on selection
  const { data: report, isLoading: isReportLoading } = useQuery<ReportResult>({
    queryKey: ['candidate-report', selectedReportEntryId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/api/v1/talent-pool/candidate-report/${selectedReportEntryId}`)
      return data
    },
    enabled: !!selectedReportEntryId,
  })

  // Re-engage candidate mutation
  const reengageMutation = useMutation({
    mutationFn: async () => {
      const request = {
        talentPoolEntryId: selectedEntryId,
        jobId: targetJobId,
      }
      const { data } = await apiClient.post('/api/v1/talent-pool/reengage', request)
      return data
    },
    onSuccess: (data: any) => {
      setMsg(data.Message || 'Re-engagement invitation sent successfully.')
      setSelectedEntryId(null)
    },
    onError: (err) => setMsg(toErrorMessage(err)),
  })

  // Trigger monthly analysis mutation
  const runAnalysisMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post('/api/v1/talent-pool/run-monthly-analysis')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['talent-pool-entries'] })
      alert('Monthly skill-gap analysis completed and progress reports generated.')
    },
  })

  if (isLoading) return <Spinner label="Loading Talent Pool Dashboard..." />
  if (isError) return <ErrorBanner message={toErrorMessage(error)} />

  // Filter entries
  const acceptedEntries = entries.filter((e) => e.consentStatus === 2 && e.isActive)
  const filteredEntries = acceptedEntries.filter((e) =>
    e.skillTags?.toLowerCase().includes(filterSkills.toLowerCase())
  )

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-head tracking-tight">Talent Pool Dashboard</h1>
          <p className="text-xs text-muted mt-1">Review skill progress and re-engage qualified previous applicants.</p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => runAnalysisMutation.mutate()}
            isLoading={runAnalysisMutation.isPending}
          >
            Run Analysis Diffs
          </Button>
        </div>
      </header>

      {msg && (
        <Card variant="borderless" className="bg-ok/10 border border-ok/20 px-4 py-3 text-xs text-head font-medium">
          {msg}
        </Card>
      )}

      {/* Filter Options */}
      <Card variant="glass" className="p-4 grid gap-4 sm:grid-cols-4 items-end">
        <div className="sm:col-span-3">
          <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1.5">Filter by skills</label>
          <input
            type="text"
            placeholder="e.g. C#, SQL Server, Docker"
            value={filterSkills}
            onChange={(e) => setFilterSkills(e.target.value)}
            className="w-full rounded-xl border border-line bg-panel-2 px-4 py-2.5 text-xs text-head placeholder-muted transition-all duration-200 focus:border-m2 focus:ring-1 focus:ring-m2/30 focus:outline-none"
          />
        </div>
        <Button size="sm" variant="primary" className="h-[40px] w-full" onClick={() => {}}>
          Filter List
        </Button>
      </Card>

      {filteredEntries.length === 0 ? (
        <EmptyState message="No active talent pool candidates match the filters." />
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Candidates list column */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xs font-bold text-head uppercase tracking-wider mb-2">Available Pooled Talent</h3>
            <div className="space-y-3">
              {filteredEntries.map((item) => (
                <Card key={item.id} variant="glass" className="p-5 border border-line hover:border-line-2 duration-150">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div>
                        <h4 className="text-xs font-bold text-head">Profile ID: {item.candidateProfileId.substring(0, 8)}</h4>
                        <p className="text-[10px] text-muted">Active since: {new Date(item.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {(item.skillTags || '').split(',').map((tag) => (
                          <span key={tag} className="px-2 py-0.5 text-[9px] bg-panel-2 border border-line rounded-md">
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-[10px] h-8"
                        onClick={() => setSelectedReportEntryId(item.id)}
                      >
                        View Report
                      </Button>
                      <Button
                        size="sm"
                        variant="primary"
                        className="text-[10px] h-8"
                        onClick={() => setSelectedEntryId(item.id)}
                      >
                        Re-Engage
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Report & Action panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Re-engagement Modal form overlay (Inline) */}
            {selectedEntryId && (
              <Card variant="glass" className="p-5 border border-m2/30 bg-m2/5 space-y-4">
                <h4 className="text-xs font-bold text-head uppercase tracking-wider">Select Re-engagement Job</h4>
                <div className="space-y-3">
                  <Select
                    label="Active Job Posting"
                    options={[
                      { value: '', label: 'Select job posting...' },
                      ...jobs.map((j) => ({ value: j.id, label: j.title })),
                    ]}
                    value={targetJobId}
                    onChange={(e) => setTargetJobId(e.target.value)}
                  />
                  <div className="flex justify-end gap-2 pt-2 border-t border-line/45">
                    <Button size="sm" variant="outline" onClick={() => setSelectedEntryId(null)}>
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      variant="primary"
                      disabled={!targetJobId}
                      isLoading={reengageMutation.isPending}
                      onClick={() => reengageMutation.mutate()}
                    >
                      Invite Candidate
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Monthly Improvement Report */}
            {selectedReportEntryId ? (
              <Card variant="glass" className="p-6 border border-line space-y-4">
                <div className="flex items-center justify-between border-b border-line pb-2.5">
                  <h4 className="text-xs font-bold text-head uppercase tracking-wider">Automated Growth Analysis</h4>
                  <button
                    onClick={() => setSelectedReportEntryId(null)}
                    className="text-muted hover:text-head text-xs"
                  >
                    Clear
                  </button>
                </div>
                
                {isReportLoading ? (
                  <Spinner label="Analysing progress logs..." />
                ) : report ? (
                  <div className="space-y-4 text-xs">
                    <div>
                      <span className="text-[10px] text-muted uppercase font-bold block mb-1">Growth Index</span>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        report.profileStrength === 'Trending Up' ? 'bg-ok/10 text-ok border border-ok/20' : 'bg-m6/10 text-m6 border border-m6/20'
                      }`}>
                        {report.profileStrength}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-muted uppercase font-bold block mb-1">Skills Gained (Snapshot Diff)</span>
                      <div className="flex flex-wrap gap-1">
                        {JSON.parse(report.skillsGainedJson || '[]').map((tag: string) => (
                          <span key={tag} className="px-2 py-0.5 bg-ok/10 text-ok border border-ok/10 rounded-md">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] text-muted uppercase font-bold block mb-1">Resume Freshness</span>
                      <span className="font-semibold text-head">{report.resumeFreshnessStatus}</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-muted uppercase font-bold block mb-1">Re-engagement Recommendation</span>
                      <p className="italic text-muted bg-panel-2/30 p-3 rounded-xl border border-line/45">{report.recommendation}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-muted">No analysis report exists for this candidate. Click "Run Analysis Diffs" above.</div>
                )}
              </Card>
            ) : (
              !selectedEntryId && (
                <div className="flex items-center justify-center h-48 border border-dashed border-line rounded-2xl bg-panel/30 text-xs text-muted text-center p-6">
                  Select a candidate's report to view monthly progress metrics or re-engage them.
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default TalentPoolDashboardPage
