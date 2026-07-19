import { ApplicationStage, ApplicationStageLabels } from '../api/types'

const STAGE_STYLES: Record<ApplicationStage, string> = {
  [ApplicationStage.Applied]: 'bg-panel-2 text-text border border-line',
  [ApplicationStage.Screening]: 'bg-m1/40 text-text border border-m1',
  [ApplicationStage.Shortlisted]: 'bg-m1/70 text-text border border-m1',
  [ApplicationStage.InterviewScheduled]: 'bg-m2/10 text-m2 border border-m2/25',
  [ApplicationStage.Interviewed]: 'bg-m2/15 text-m2 border border-m2/30',
  [ApplicationStage.Offered]: 'bg-m2/20 text-m2 border border-m2/35',
  [ApplicationStage.Hired]: 'bg-m2 text-white border border-m2 shadow-sm shadow-m2/15',
  [ApplicationStage.Rejected]: 'bg-alert/10 text-alert border border-alert/20',
}

export function StageBadge({ stage }: { stage: ApplicationStage }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${STAGE_STYLES[stage]}`}>
      {ApplicationStageLabels[stage]}
    </span>
  )
}
