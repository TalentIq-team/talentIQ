import React from 'react'

export const ApplicationStage = {
  Applied: 1,
  Screening: 2,
  Shortlisted: 3,
  InterviewScheduled: 4,
  Interviewed: 5,
  Offered: 6,
  Hired: 7,
  Rejected: 8,
} as const

type StageKey = keyof typeof ApplicationStage
type StageValue = typeof ApplicationStage[StageKey]

interface StageBadgeProps {
  stage: StageValue | StageKey
}

export const StageBadge: React.FC<StageBadgeProps> = ({ stage }) => {
  const stageNum = typeof stage === 'string' ? ApplicationStage[stage] : stage

  const config: Record<StageValue, { label: string; style: string }> = {
    [ApplicationStage.Applied]: {
      label: 'Applied',
      style: 'bg-line/50 text-head border-line/30',
    },
    [ApplicationStage.Screening]: {
      label: 'Screening',
      style: 'bg-m3/10 text-m3 border-m3/20',
    },
    [ApplicationStage.Shortlisted]: {
      label: 'Shortlisted',
      style: 'bg-m2/10 text-m2 border-m2/20',
    },
    [ApplicationStage.InterviewScheduled]: {
      label: 'Interview Scheduled',
      style: 'bg-m1/10 text-m1 border-m1/20',
    },
    [ApplicationStage.Interviewed]: {
      label: 'Interviewed',
      style: 'bg-m4/10 text-m4 border-m4/20',
    },
    [ApplicationStage.Offered]: {
      label: 'Offered',
      style: 'bg-m6/10 text-m6 border-m6/20',
    },
    [ApplicationStage.Hired]: {
      label: 'Hired',
      style: 'bg-ok/10 text-ok border-ok/20',
    },
    [ApplicationStage.Rejected]: {
      label: 'Rejected',
      style: 'bg-alert/10 text-alert border-alert/20',
    },
  }

  const badge = config[stageNum as StageValue] || {
    label: 'Unknown',
    style: 'bg-line/20 text-muted border-line/10',
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${badge.style}`}
    >
      {badge.label}
    </span>
  )
}

export default StageBadge
