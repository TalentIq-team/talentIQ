import React, { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import AiMatchBreakdown from '@/features/ai/components/AiMatchBreakdown'
import GenerateQuestionsPanel from '@/features/ai/components/GenerateQuestionsPanel'
import JobRecommendations from '@/features/ai/components/JobRecommendations'

export const TestAiPanelsPage: React.FC = () => {
  const queryClient = useQueryClient()
  
  // Controls state
  const [matchState, setMatchState] = useState<'ready' | 'empty'>('ready')
  const [questionsState, setQuestionsState] = useState<'ready' | 'empty'>('ready')
  const [jobsState, setJobsState] = useState<'ready' | 'empty'>('ready')
  
  // Custom job parameters for questions generator
  const [jobTitle, setJobTitle] = useState('Senior Frontend Developer')
  const [jobDesc, setJobDesc] = useState(
    'We are looking for a Senior Frontend Developer proficient in React, TypeScript, TailwindCSS, and responsive styling. Experience with data visualization and design systems is highly preferred.'
  )

  // Force reset all caches
  const handleResetCaches = () => {
    queryClient.resetQueries({ queryKey: ['ai-analysis'] })
    queryClient.resetQueries({ queryKey: ['interview-questions'] })
    queryClient.resetQueries({ queryKey: ['job-recommendations'] })
    alert('Query caches cleared. Panels will re-trigger their simulated loading spinners.')
  }

  // Calculate dynamic demo ids based on control state
  const matchAppId = matchState === 'ready' ? 'demo' : 'demo-empty'
  const questionsAppId = questionsState === 'ready' ? 'demo' : 'demo-empty'
  const jobsCandidateId = jobsState === 'ready' ? 'demo' : 'demo-empty'

  return (
    <div className="min-h-screen w-full bg-ink text-text p-6 md:p-10 font-sans selection:bg-selection">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-line pb-6 gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-head tracking-tight flex items-center gap-2.5">
              <span className="w-2.5 h-8 bg-gradient-to-b from-[#7B2CBF] to-[#0466C8] rounded-full inline-block" />
              AI Component Playground
            </h1>
            <p className="text-xs text-muted mt-1 max-w-xl leading-relaxed">
              Test and verify all AI scorecards, question generator templates, and recommender elements locally. 
              Configure initial states, clear query states, and test mutations without logging in.
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handleResetCaches}
              className="px-4 py-2 border border-line text-xs font-semibold rounded-lg hover:bg-panel-2 transition-all flex items-center gap-2 cursor-pointer bg-panel"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M9 11l3-3m0 0l3 3m-3-3v8" />
              </svg>
              Reset Loading States
            </button>
            
            <a
              href="/login"
              className="px-4 py-2 bg-head text-white text-xs font-semibold rounded-lg hover:opacity-90 transition-all flex items-center gap-2"
            >
              Back to Login
            </a>
          </div>
        </div>

        {/* Sandbox Controls Dashboard */}
        <div className="bg-panel border border-line/65 rounded-2xl p-5 shadow-sm space-y-5">
          <div className="flex items-center gap-2 border-b border-line pb-3">
            <svg className="w-4 h-4 text-[#7B2CBF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-head">Sandbox Controls</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Control 1 */}
            <div className="space-y-2">
              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted block">
                Match Scorecard State
              </label>
              <div className="flex bg-ink rounded-lg p-0.5 border border-line">
                <button
                  onClick={() => setMatchState('ready')}
                  className={`flex-1 text-center py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                    matchState === 'ready' ? 'bg-panel shadow-sm text-head font-bold' : 'text-muted hover:text-text'
                  }`}
                >
                  Populated Scorecard
                </button>
                <button
                  onClick={() => setMatchState('empty')}
                  className={`flex-1 text-center py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                    matchState === 'empty' ? 'bg-panel shadow-sm text-head font-bold' : 'text-muted hover:text-text'
                  }`}
                >
                  Unanalyzed State
                </button>
              </div>
            </div>

            {/* Control 2 */}
            <div className="space-y-2">
              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted block">
                Interview Questions State
              </label>
              <div className="flex bg-ink rounded-lg p-0.5 border border-line">
                <button
                  onClick={() => setQuestionsState('ready')}
                  className={`flex-1 text-center py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                    questionsState === 'ready' ? 'bg-panel shadow-sm text-head font-bold' : 'text-muted hover:text-text'
                  }`}
                >
                  Populated Questions
                </button>
                <button
                  onClick={() => setQuestionsState('empty')}
                  className={`flex-1 text-center py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                    questionsState === 'empty' ? 'bg-panel shadow-sm text-head font-bold' : 'text-muted hover:text-text'
                  }`}
                >
                  Empty State
                </button>
              </div>
            </div>

            {/* Control 3 */}
            <div className="space-y-2">
              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted block">
                Job Recommender State
              </label>
              <div className="flex bg-ink rounded-lg p-0.5 border border-line">
                <button
                  onClick={() => setJobsState('ready')}
                  className={`flex-1 text-center py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                    jobsState === 'ready' ? 'bg-panel shadow-sm text-head font-bold' : 'text-muted hover:text-text'
                  }`}
                >
                  Populated Suggestions
                </button>
                <button
                  onClick={() => setJobsState('empty')}
                  className={`flex-1 text-center py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                    jobsState === 'empty' ? 'bg-panel shadow-sm text-head font-bold' : 'text-muted hover:text-text'
                  }`}
                >
                  No Skills Suggestion
                </button>
              </div>
            </div>

          </div>

          {/* Configurable Prompt Params */}
          <div className="border-t border-line/50 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted block">
                Simulated Job Title
              </label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full bg-ink text-xs font-medium border border-line rounded-lg px-3 py-2 text-head focus:outline-none focus:border-[#7B2CBF] transition-all"
                placeholder="e.g. Senior Frontend Developer"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted block">
                Simulated Job Description
              </label>
              <textarea
                value={jobDesc}
                onChange={(e) => setJobDesc(e.target.value)}
                rows={2}
                className="w-full bg-ink text-xs font-medium border border-line rounded-lg px-3 py-1.5 text-head focus:outline-none focus:border-[#7B2CBF] transition-all resize-y"
                placeholder="Job description details..."
              />
            </div>
          </div>
        </div>

        {/* AI Components Section Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Column: Match Breakdown & Questions Panel */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Match Breakdown Card */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-mono font-bold text-muted uppercase tracking-wider">
                  Component: AiMatchBreakdown
                </span>
                <span className="text-[10px] bg-[#E9F5F3] text-ok px-2 py-0.5 rounded font-mono font-bold border border-ok/25">
                  Local-Safe
                </span>
              </div>
              <AiMatchBreakdown applicationId={matchAppId} />
            </div>

            {/* Questions Generator Card */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-mono font-bold text-muted uppercase tracking-wider">
                  Component: GenerateQuestionsPanel
                </span>
                <span className="text-[10px] bg-[#E9F5F3] text-ok px-2 py-0.5 rounded font-mono font-bold border border-ok/25">
                  Local-Safe
                </span>
              </div>
              <GenerateQuestionsPanel
                applicationId={questionsAppId}
                jobTitle={jobTitle}
                jobDescription={jobDesc}
              />
            </div>

          </div>

          {/* Right Column: Recommendations */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-mono font-bold text-muted uppercase tracking-wider">
                Component: JobRecommendations
              </span>
              <span className="text-[10px] bg-[#E9F5F3] text-ok px-2 py-0.5 rounded font-mono font-bold border border-ok/25">
                Local-Safe
              </span>
            </div>
            <JobRecommendations candidateProfileId={jobsCandidateId} />
          </div>

        </div>

      </div>
    </div>
  )
}

export default TestAiPanelsPage
