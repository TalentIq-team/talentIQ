import React from 'react'

const ApplicationStage = {
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
      style: 'bg-panel-2 text-text border-line',
    },
    [ApplicationStage.Screening]: {
      label: 'Screening',
      style: 'bg-m1/40 text-text border-m1',
    },
    [ApplicationStage.Shortlisted]: {
      label: 'Shortlisted',
      style: 'bg-m1/70 text-text border-m1',
    },
    [ApplicationStage.InterviewScheduled]: {
      label: 'Interview scheduled',
      style: 'bg-m2/10 text-m2 border-m2/25',
    },
    [ApplicationStage.Interviewed]: {
      label: 'Interviewed',
      style: 'bg-m2/15 text-m2 border-m2/30',
    },
    [ApplicationStage.Offered]: {
      label: 'Offered',
      style: 'bg-m2/20 text-m2 border-m2/35',
    },
    [ApplicationStage.Hired]: {
      label: 'Hired',
      style: 'bg-m2 text-white border-m2 shadow-sm shadow-m2/15',
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
