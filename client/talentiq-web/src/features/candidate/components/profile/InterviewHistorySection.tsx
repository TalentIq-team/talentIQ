import React from 'react'

export const InterviewHistorySection: React.FC = () => {
  // Sample interview records for candidate dashboard
  const sampleInterviews = [
    {
      id: '1',
      jobTitle: 'Senior React Architect',
      company: 'TalentIQ Core Tech',
      date: '2026-07-15',
      interviewer: 'Hiring Manager',
      result: 'Passed Stage 2',
      techScore: 92,
      behaviouralScore: 88,
      feedback: 'Demonstrated exceptional knowledge in frontend architecture, state management, and performance tuning.',
    },
  ]

  return (
    <div className="rounded-2xl border border-line bg-panel p-6 shadow-sm text-left">
      <div className="border-b border-line pb-4 mb-4">
        <h3 className="font-display text-base font-bold text-head flex items-center gap-2">
          🎙️ Interview History & Evaluation Feedback
        </h3>
        <p className="text-xs text-muted mt-0.5">Read-only transcript of completed interviews, technical ratings, and feedback.</p>
      </div>

      <div className="space-y-4">
        {sampleInterviews.map((item) => (
          <div key={item.id} className="p-4 rounded-xl bg-panel-2/30 border border-line/60 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h4 className="text-sm font-bold text-head">{item.jobTitle}</h4>
                <p className="text-xs font-semibold text-accent">{item.company} • Interviewed by {item.interviewer}</p>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {item.result}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 p-3 rounded-lg bg-panel border border-line text-xs font-mono">
              <div>Technical Rating: <span className="text-emerald-400 font-bold">{item.techScore}/100</span></div>
              <div>Behavioral Rating: <span className="text-emerald-400 font-bold">{item.behaviouralScore}/100</span></div>
            </div>

            <p className="text-xs text-text italic bg-panel-2/20 p-3 rounded-lg border border-line/40">
              "{item.feedback}"
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default InterviewHistorySection
