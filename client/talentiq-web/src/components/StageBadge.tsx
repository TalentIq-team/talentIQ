import { ApplicationStage, ApplicationStageLabels } from '../api/types'

const STAGE_STYLES: Record<ApplicationStage, string> = {
  [ApplicationStage.Applied]: 'bg-slate-100 text-slate-700',
  [ApplicationStage.Screening]: 'bg-blue-100 text-blue-700',
  [ApplicationStage.Shortlisted]: 'bg-indigo-100 text-indigo-700',
  [ApplicationStage.InterviewScheduled]: 'bg-violet-100 text-violet-700',
  [ApplicationStage.Interviewed]: 'bg-purple-100 text-purple-700',
  [ApplicationStage.Offered]: 'bg-amber-100 text-amber-700',
  [ApplicationStage.Hired]: 'bg-green-100 text-green-700',
  [ApplicationStage.Rejected]: 'bg-red-100 text-red-700',
}

export function StageBadge({ stage }: { stage: ApplicationStage }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${STAGE_STYLES[stage]}`}>
      {ApplicationStageLabels[stage]}
    </span>
  )
}
