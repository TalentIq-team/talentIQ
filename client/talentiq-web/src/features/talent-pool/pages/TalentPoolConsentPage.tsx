import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient, toErrorMessage } from '@/lib/api'
import { getCandidateProfileId } from '@/api/session'
import { Spinner, ErrorBanner } from '@/components/Feedback'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

interface TalentPoolEntry {
  id: string
  candidateProfileId: string
  consentStatus: number // 1 = Pending, 2 = Accepted, 3 = Declined, 4 = Expired, 5 = Withdrawn
  isActive: boolean
  createdAt: string
  consentExpiryDate: string | null
  skillTags: string
}

export const TalentPoolConsentPage: React.FC = () => {
  const queryClient = useQueryClient()
  const candidateProfileId = getCandidateProfileId()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Query all talent pool dashboard entries and filter for this candidate
  const { data: entries = [], isLoading, isError } = useQuery<TalentPoolEntry[]>({
    queryKey: ['talent-pool-candidate', candidateProfileId],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/v1/talent-pool/dashboard')
      return (data || []).filter((e: any) => e.candidateProfileId === candidateProfileId || e.CandidateProfileId === candidateProfileId)
    },
    enabled: !!candidateProfileId,
  })

  // Respond consent mutation
  const respondMutation = useMutation({
    mutationFn: async ({ entryId, accept }: { entryId: string; accept: boolean }) => {
      setError(null)
      setSuccess(null)
      const request = {
        talentPoolEntryId: entryId,
        accept,
        profileSnapshotJson: JSON.stringify({
          optInDate: new Date().toISOString(),
          skillsSnapshot: ['Software Engineering', 'System Design'],
        }),
      }
      await apiClient.post('/api/v1/talent-pool/respond-consent', request)
    },
    onSuccess: (_, variables) => {
      setSuccess(variables.accept ? 'You have successfully opted into the Talent Pool.' : 'You have declined the request.')
      queryClient.invalidateQueries({ queryKey: ['talent-pool-candidate', candidateProfileId] })
    },
    onError: (err) => setError(toErrorMessage(err)),
  })

  // Withdraw consent mutation
  const withdrawMutation = useMutation({
    mutationFn: async (entryId: string) => {
      setError(null)
      setSuccess(null)
      await apiClient.post('/api/v1/talent-pool/withdraw-consent', { talentPoolEntryId: entryId })
    },
    onSuccess: () => {
      setSuccess('Your consent has been successfully withdrawn. You are no longer in the Talent Pool.')
      queryClient.invalidateQueries({ queryKey: ['talent-pool-candidate', candidateProfileId] })
    },
    onError: (err) => setError(toErrorMessage(err)),
  })

  if (!candidateProfileId) {
    return (
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-black text-head">Talent Pool Consent</h1>
          <p className="text-xs text-muted mt-1">Manage your professional talent pool listing and consent settings.</p>
        </header>
        <Card variant="glass" className="p-6 text-center text-xs text-muted border border-dashed border-line">
          Please create and save your candidate profile first in the "My Profile" page before accessing the Talent Pool.
        </Card>
      </div>
    )
  }

  if (isLoading) return <Spinner label="Loading consent dashboard..." />

  // Filter entry states
  const activeEntry = entries.find((e) => e.consentStatus === 2 && e.isActive)
  const pendingEntry = entries.find((e) => e.consentStatus === 1 && e.isActive)

  const statusLabel = (status: number) => {
    switch (status) {
      case 1: return <span className="px-2 py-0.5 text-[9px] font-bold bg-m6/10 text-m6 border border-m6/10 rounded-md">Pending Response</span>
      case 2: return <span className="px-2 py-0.5 text-[9px] font-bold bg-ok/10 text-ok border border-ok/10 rounded-md">Consent Active</span>
      case 3: return <span className="px-2 py-0.5 text-[9px] font-bold bg-muted/10 text-muted border border-line rounded-md">Declined</span>
      case 4: return <span className="px-2 py-0.5 text-[9px] font-bold bg-alert/10 text-alert border border-alert/10 rounded-md">Expired</span>
      case 5: return <span className="px-2 py-0.5 text-[9px] font-bold bg-alert/10 text-alert border border-alert/10 rounded-md">Withdrawn</span>
      default: return null
    }
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <header>
        <h1 className="text-2xl font-black text-head tracking-tight">Talent Pool Consent</h1>
        <p className="text-xs text-muted mt-1">Control your data privacy, opt-in settings, and re-engagement listings.</p>
      </header>

      {error && <ErrorBanner message={error} />}
      {success && (
        <Card variant="borderless" className="bg-ok/10 border border-ok/20 px-4 py-3 text-xs text-head font-medium">
          {success}
        </Card>
      )}

      {/* Information disclosure */}
      <Card variant="glass" className="p-6 border border-line space-y-4">
        <h3 className="text-sm font-bold text-head uppercase tracking-wider">About the Talent Pool</h3>
        <p className="text-xs text-text leading-relaxed">
          The TalentIQ Talent Pool allows our recruitment teams to keep your details on file even if your current application is not selected. By joining the pool:
        </p>
        <ul className="list-disc pl-5 text-xs text-muted space-y-2">
          <li>We will run a monthly automated analysis of your profile skill improvements to check for new job fit.</li>
          <li>You will be proposed for matching positions across our business divisions.</li>
          <li>Your consent automatically expires after 12 months, and you can withdraw it at any time.</li>
        </ul>
      </Card>

      {/* Dynamic proposal action cards */}
      {pendingEntry && (
        <Card variant="glass" className="p-6 border border-m6/30 bg-m6/5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-head uppercase tracking-wider">Recruiter Invitation Pending</h4>
            {statusLabel(pendingEntry.consentStatus)}
          </div>
          <p className="text-xs text-muted">
            A recruiter has requested to add you to the Talent Pool for future matches with skill tags: <strong className="text-head">{pendingEntry.skillTags || 'General skills'}</strong>.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              isLoading={respondMutation.isPending}
              onClick={() => respondMutation.mutate({ entryId: pendingEntry.id, accept: false })}
            >
              Decline Request
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={respondMutation.isPending}
              onClick={() => respondMutation.mutate({ entryId: pendingEntry.id, accept: true })}
            >
              Accept & Share Profile
            </Button>
          </div>
        </Card>
      )}

      {activeEntry ? (
        <Card variant="glass" className="p-6 border border-ok/20 bg-ok/5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-head uppercase tracking-wider">Your Listing is Active</h4>
            {statusLabel(activeEntry.consentStatus)}
          </div>
          <div className="grid gap-4 sm:grid-cols-2 text-xs">
            <div>
              <span className="text-[10px] text-muted uppercase font-semibold block">Joined On</span>
              <span className="font-medium text-head">{new Date(activeEntry.createdAt).toLocaleDateString()}</span>
            </div>
            <div>
              <span className="text-[10px] text-muted uppercase font-semibold block">Expires On</span>
              <span className="font-medium text-head">
                {activeEntry.consentExpiryDate ? new Date(activeEntry.consentExpiryDate).toLocaleDateString() : '1 Year'}
              </span>
            </div>
          </div>
          <div className="pt-4 border-t border-line/50 flex justify-end">
            <Button
              variant="danger"
              size="sm"
              isLoading={withdrawMutation.isPending}
              onClick={() => withdrawMutation.mutate(activeEntry.id)}
            >
              Withdraw Consent
            </Button>
          </div>
        </Card>
      ) : (
        !pendingEntry && (
          <Card variant="glass" className="p-6 border border-line text-center text-xs text-muted">
            You are not currently listed in the Talent Pool. Recruiter invitations will appear here.
          </Card>
        )
      )}
    </div>
  )
}

export default TalentPoolConsentPage
