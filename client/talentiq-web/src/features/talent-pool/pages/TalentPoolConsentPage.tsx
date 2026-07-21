import '../../analytics/m6-design.css'
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { getCandidateProfileId } from '@/api/session'
import { toErrorMessage } from '@/lib/api'
import {
  ConsentStatus,
  getTalentPoolEntries,
  respondToTalentPoolConsent,
  withdrawTalentPoolConsent,
  type TalentPoolEntry,
} from '../api/talentPoolApi'

const STATUS_LABEL: Record<number, string> = {
  [ConsentStatus.Pending]: 'Pending',
  [ConsentStatus.Accepted]: 'Accepted',
  [ConsentStatus.Declined]: 'Declined',
  [ConsentStatus.Withdrawn]: 'Withdrawn',
  [ConsentStatus.Expired]: 'Expired',
}

function formatDate(value: string | null): string {
  if (!value) {
    return 'Not available'
  }

  return new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(value))
}

function getStatusClass(status: number): string {
  if (status === ConsentStatus.Accepted) {
    return 'border-ok/20 bg-ok/10 text-ok'
  }

  if (
    status === ConsentStatus.Declined ||
    status === ConsentStatus.Withdrawn ||
    status === ConsentStatus.Expired
  ) {
    return 'border-alert/20 bg-alert/10 text-alert'
  }

  return 'border-m2/20 bg-m2/10 text-m2'
}

function ConsentDetails({ entry }: { entry: TalentPoolEntry }) {
  const skills = entry.skillTags
    .split(',')
    .map((skill) => skill.trim())
    .filter(Boolean)

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            Talent Pool Invitation
          </p>

          <h2 className="mt-1 text-xl font-bold text-head">
            Recruitment Talent Pool
          </h2>
        </div>

        <span
          className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClass(
            entry.consentStatus,
          )}`}
        >
          {STATUS_LABEL[entry.consentStatus] ?? 'Unknown'}
        </span>
      </div>

      <p className="text-sm leading-relaxed text-text">
        Your profile has been proposed for the TalentIQ talent pool. Accepting
        allows authorised recruiters to review your stored profile snapshot and
        contact you about suitable opportunities.
      </p>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
          Skill Tags
        </p>

        {skills.length === 0 ? (
          <p className="text-sm text-muted">No skill tags were provided.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="rounded-lg border border-line bg-panel-2 px-3 py-1 text-xs font-medium text-head"
              >
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-4 rounded-xl border border-line bg-panel-2 p-4 sm:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted">
            Invitation received
          </p>
          <p className="mt-1 text-sm font-semibold text-head">
            {formatDate(entry.createdAt)}
          </p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wider text-muted">
            Consent expiry
          </p>
          <p className="mt-1 text-sm font-semibold text-head">
            {formatDate(entry.consentExpiryDate)}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-m2/20 bg-m2/5 p-4">
        <h3 className="text-sm font-semibold text-head">
          Your privacy rights
        </h3>

        <p className="mt-2 text-xs leading-relaxed text-muted">
          Participation is voluntary. You may decline the invitation or
          withdraw previously accepted consent. Withdrawing consent removes
          your profile from active talent pool use.
        </p>
      </div>
    </div>
  )
}

export default function TalentPoolConsentPage() {
  const queryClient = useQueryClient()
  const candidateProfileId = getCandidateProfileId()
  const [message, setMessage] = useState<string | null>(null)

  const entriesQuery = useQuery({
    queryKey: ['talent-pool', 'entries'],
    queryFn: getTalentPoolEntries,
  })

  const respondMutation = useMutation({
    mutationFn: ({
      entry,
      accept,
    }: {
      entry: TalentPoolEntry
      accept: boolean
    }) =>
      respondToTalentPoolConsent(
        entry.id,
        accept,
        accept
          ? JSON.stringify({
              candidateProfileId: entry.candidateProfileId,
              capturedAt: new Date().toISOString(),
            })
          : '{}',
      ),

    onSuccess: (result) => {
      setMessage(result.message)

      queryClient.invalidateQueries({
        queryKey: ['talent-pool', 'entries'],
      })
    },

    onError: (error) => {
      setMessage(toErrorMessage(error))
    },
  })

  const withdrawMutation = useMutation({
    mutationFn: (entryId: string) =>
      withdrawTalentPoolConsent(entryId),

    onSuccess: (result) => {
      setMessage(result)

      queryClient.invalidateQueries({
        queryKey: ['talent-pool', 'entries'],
      })
    },

    onError: (error) => {
      setMessage(toErrorMessage(error))
    },
  })

  if (entriesQuery.isLoading) {
    return (
      <Card variant="glass" className="p-8">
        <LoadingSpinner label="Loading talent pool invitation..." />
      </Card>
    )
  }

  if (entriesQuery.isError) {
    return (
      <ErrorState
        title="Unable to load consent details"
        message={toErrorMessage(entriesQuery.error)}
        onRetry={() => entriesQuery.refetch()}
      />
    )
  }

  if (!candidateProfileId) {
    return (
      <EmptyState
        title="Candidate profile required"
        message="Create or open your candidate profile before viewing talent pool invitations."
      />
    )
  }

  const candidateEntries =
    entriesQuery.data
      ?.filter(
        (entry) =>
          entry.candidateProfileId === candidateProfileId,
      )
      .sort(
        (first, second) =>
          new Date(second.createdAt).getTime() -
          new Date(first.createdAt).getTime(),
      ) ?? []

  const entry = candidateEntries[0]

  if (!entry) {
    return (
      <EmptyState
        title="No talent pool invitation"
        message="You do not currently have a talent pool invitation."
      />
    )
  }

  const isResponding = respondMutation.isPending
  const isWithdrawing = withdrawMutation.isPending

  return (
    <div className="m6-page mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-head">
          Talent Pool Consent
        </h1>

        <p className="mt-1 text-sm text-muted">
          Review and manage permission for your profile to remain in the
          recruitment talent pool.
        </p>
      </header>

      {message && (
        <Card
          variant="borderless"
          className="border border-m2/20 bg-m2/10 px-4 py-3 text-sm font-medium text-head"
        >
          {message}
        </Card>
      )}

      <Card variant="glass" className="p-6">
        <ConsentDetails entry={entry} />

        <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-line pt-5">
          {entry.consentStatus === ConsentStatus.Pending && (
            <>
              <Button
                variant="danger"
                disabled={isResponding}
                onClick={() =>
                  respondMutation.mutate({
                    entry,
                    accept: false,
                  })
                }
              >
                Decline
              </Button>

              <Button
                variant="primary"
                className="m6-primary-action"
                isLoading={isResponding}
                onClick={() =>
                  respondMutation.mutate({
                    entry,
                    accept: true,
                  })
                }
              >
                Accept Consent
              </Button>
            </>
          )}

          {entry.consentStatus === ConsentStatus.Accepted && (
            <Button
              variant="danger"
              isLoading={isWithdrawing}
              onClick={() => withdrawMutation.mutate(entry.id)}
            >
              Withdraw Consent
            </Button>
          )}

          {entry.consentStatus !== ConsentStatus.Pending &&
            entry.consentStatus !== ConsentStatus.Accepted && (
              <p className="text-sm text-muted">
                No further consent action is available for this invitation.
              </p>
            )}
        </div>
      </Card>
    </div>
  )
}
