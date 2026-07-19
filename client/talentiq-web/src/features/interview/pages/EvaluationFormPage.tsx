import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient, toErrorMessage } from '@/lib/api'
import { Spinner, ErrorBanner, EmptyState } from '@/components/Feedback'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

interface Interview {
  id: string
  applicationId: string
  scheduledStartTime: string
  interviewerUserId: string
  meetingLink: string
  status: number
}

export const EvaluationFormPage: React.FC = () => {
  const queryClient = useQueryClient()
  const [selectedInterviewId, setSelectedInterviewId] = useState<string | null>(null)
  
  // Scorecard state
  const [techScore, setTechScore] = useState(8)
  const [behavioralScore, setBehavioralScore] = useState(8)
  const [recommendation, setRecommendation] = useState('Highly recommended; strong alignment with role requirements.')
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Query interviews
  const { data: interviews = [], isLoading, isError } = useQuery<Interview[]>({
    queryKey: ['interviews'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/Interview')
      return data
    },
  })

  // Submit evaluation mutation
  const evalMutation = useMutation({
    mutationFn: async () => {
      setError(null)
      setSuccessMsg(null)
      const command = {
        interviewId: selectedInterviewId,
        technicalScore: Number(techScore),
        behavioralScore: Number(behavioralScore),
        recommendation,
      }
      await apiClient.post('/api/Interview/evaluation', command)
    },
    onSuccess: () => {
      setSuccessMsg('Evaluation submitted successfully.')
      queryClient.invalidateQueries({ queryKey: ['interviews'] })
      // Auto-advance application stage to Interviewed (stage = 5)
      const selected = interviews.find((i) => i.id === selectedInterviewId)
      if (selected) {
        apiClient.put(`/api/v1/applications/${selected.applicationId}/stage`, {
          targetStage: 5, // Interviewed
          note: `Auto advanced on evaluation submission. Recommendation: ${recommendation}`,
        }).catch((err) => console.error('Failed to advance application stage', err))
      }
      setSelectedInterviewId(null)
    },
    onError: (err) => {
      setError(toErrorMessage(err))
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedInterviewId) return
    evalMutation.mutate()
  }

  if (isLoading) return <Spinner label="Loading evaluations workspace..." />

  const today = new Date().toDateString()
  const todayInterviews = interviews.filter((i) => new Date(i.scheduledStartTime).toDateString() === today && i.status === 1)
  const upcomingInterviews = interviews.filter((i) => new Date(i.scheduledStartTime).getTime() > Date.now() && i.status === 1)
  const completedInterviews = interviews.filter((i) => i.status === 2)

  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <h1 className="text-2xl font-black text-head tracking-tight">Evaluations Scorecard</h1>
        <p className="text-xs text-muted mt-1">Submit scores and hiring recommendations for interviewed candidates.</p>
      </header>

      {successMsg && (
        <Card variant="borderless" className="bg-ok/10 border border-ok/20 px-4 py-3 text-xs text-head font-medium">
          {successMsg}
        </Card>
      )}

      {interviews.length === 0 ? (
        <EmptyState message="No scheduled interviews found in the system." />
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Calendar & Schedule list */}
          <div className="lg:col-span-1 space-y-6">
            {/* Today's schedule */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-head uppercase tracking-wider">Today's Interviews</h3>
              {todayInterviews.length === 0 ? (
                <div className="text-xs text-muted border border-dashed border-line p-4 rounded-2xl text-center bg-panel-2/10">
                  No interviews scheduled for today.
                </div>
              ) : (
                todayInterviews.map((item) => (
                  <Card
                    key={item.id}
                    variant="glass"
                    onClick={() => {
                      setSelectedInterviewId(item.id)
                      setSuccessMsg(null)
                    }}
                    className={`p-4 border transition-all duration-200 cursor-pointer ${
                      selectedInterviewId === item.id ? 'border-m3/70 bg-m3/5' : 'border-line hover:border-line-2'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-m3 bg-m3/10 px-1.5 py-0.5 rounded-md uppercase">
                          Today
                        </span>
                        <span className="text-[10px] text-muted font-mono">{new Date(item.scheduledStartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-xs font-bold text-head">Application ID: {item.applicationId.substring(0, 8)}</p>
                      <a href={item.meetingLink} target="_blank" rel="noreferrer" className="text-[10px] text-m3 hover:underline truncate block" onClick={(e) => e.stopPropagation()}>
                        Join Video Call ↗
                      </a>
                    </div>
                  </Card>
                ))
              )}
            </div>

            {/* Upcoming Interviews */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-head uppercase tracking-wider">Upcoming Schedule</h3>
              {upcomingInterviews.length === 0 ? (
                <div className="text-xs text-muted border border-dashed border-line p-4 rounded-2xl text-center bg-panel-2/10">
                  No upcoming interviews.
                </div>
              ) : (
                upcomingInterviews.slice(0, 5).map((item) => (
                  <Card
                    key={item.id}
                    variant="glass"
                    onClick={() => {
                      setSelectedInterviewId(item.id)
                      setSuccessMsg(null)
                    }}
                    className={`p-4 border transition-all duration-200 cursor-pointer ${
                      selectedInterviewId === item.id ? 'border-m3/70 bg-m3/5' : 'border-line hover:border-line-2'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-muted">
                          {new Date(item.scheduledStartTime).toLocaleDateString()}
                        </span>
                        <span className="text-[10px] text-muted font-mono">{new Date(item.scheduledStartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-xs font-bold text-head">Application ID: {item.applicationId.substring(0, 8)}</p>
                    </div>
                  </Card>
                ))
              )}
            </div>

            {/* Completed */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-head uppercase tracking-wider">Completed</h3>
              {completedInterviews.map((item) => (
                <Card key={item.id} variant="glass" className="p-4 border-line bg-panel-2/10 opacity-75">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-muted">{new Date(item.scheduledStartTime).toLocaleDateString()}</span>
                    <span className="text-ok font-bold uppercase">Evaluated</span>
                  </div>
                  <p className="text-xs text-text mt-1">Application: {item.applicationId.substring(0, 8)}</p>
                </Card>
              ))}
            </div>
          </div>

          {/* Feedback Form Panel */}
          <div className="lg:col-span-2">
            {selectedInterviewId ? (
              <Card variant="glass" className="p-6 border border-line">
                <h3 className="text-sm font-bold text-head uppercase tracking-wider mb-4 pb-2 border-b border-line">
                  Submit Candidate Evaluation
                </h3>
                <form onSubmit={handleSubmit} className="space-y-5">
                  {error && (
                    <div className="rounded-xl border border-alert/20 bg-alert/5 p-3 text-xs text-alert">
                      {error}
                    </div>
                  )}

                  {/* Tech Score slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-head">Technical Alignment Score</span>
                      <span className="text-m3 font-bold">{techScore} / 10</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={techScore}
                      onChange={(e) => setTechScore(Number(e.target.value))}
                      className="w-full h-1.5 bg-line rounded-lg appearance-none cursor-pointer accent-m3"
                    />
                    <p className="text-[10px] text-muted">Rate the candidate's coding skills, architecture capability, and tech knowledge.</p>
                  </div>

                  {/* Behavioral Score slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-head">Behavioral & Culture Fit Score</span>
                      <span className="text-m3 font-bold">{behavioralScore} / 10</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={behavioralScore}
                      onChange={(e) => setBehavioralScore(Number(e.target.value))}
                      className="w-full h-1.5 bg-line rounded-lg appearance-none cursor-pointer accent-m3"
                    />
                    <p className="text-[10px] text-muted">Rate alignment with company core values, team collaboration, and communication.</p>
                  </div>

                  {/* Comments / Recommendation details */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-head uppercase tracking-wider">
                      Overall Recommendation Note
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={recommendation}
                      onChange={(e) => setRecommendation(e.target.value)}
                      placeholder="Add detailed feedback and recommendations regarding the candidate..."
                      className="w-full rounded-xl border border-line bg-panel-2 px-4 py-2.5 text-xs text-head placeholder-muted transition-all duration-200 focus:border-m3 focus:ring-1 focus:ring-m3/30 outline-none"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-3 border-t border-line/45">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedInterviewId(null)}
                    >
                      Clear Selection
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      isLoading={evalMutation.isPending}
                    >
                      Submit Feedback
                    </Button>
                  </div>
                </form>
              </Card>
            ) : (
              <div className="flex items-center justify-center h-64 border border-dashed border-line rounded-2xl bg-panel/30 text-xs text-muted text-center p-6">
                Select an active interview slot from the schedule on the left to submit evaluation scores.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default EvaluationFormPage
