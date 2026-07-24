import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { Spinner } from '@/components/Feedback'
import FallbackBadge from './FallbackBadge'
import './AiPanels.css'

const generatedQuestionsApplications = new Set<string>()

interface GenerateQuestionsPanelProps {
  applicationId: string
  jobTitle: string
  jobDescription?: string
  className?: string
}

interface InterviewQuestion {
  questionText: string
  expectedAnswerDetails: string
  category: string
}

interface QuestionSetResult {
  id: string
  applicationId: string
  questions: InterviewQuestion[]
  isFallbackExecution: boolean
  createdAt: string
}

export const GenerateQuestionsPanel: React.FC<GenerateQuestionsPanelProps> = ({
  applicationId,
  jobTitle,
  jobDescription = '',
  className = '',
}) => {
  const queryClient = useQueryClient()

  // Fetch the stored questions
  const { data: questionSet, isLoading, isError, refetch } = useQuery<QuestionSetResult>({
    queryKey: ['interview-questions', applicationId],
    queryFn: async () => {
      if (applicationId.startsWith('demo')) {
        await new Promise((resolve) => setTimeout(resolve, 800))
        if (applicationId === 'demo-empty' && !generatedQuestionsApplications.has(applicationId)) {
          return null
        }
        return {
          id: 'demo-question-set-id',
          applicationId,
          questions: [
            {
              questionText: 'Can you describe a challenging React state management problem you faced and how you solved it?',
              expectedAnswerDetails: 'Candidate should mention Context API, Redux Toolkit, or Zustand. Look for discussions on rendering performance, state normalization, and clear rationale for their chosen tool.',
              category: 'Technical - React'
            },
            {
              questionText: 'How do you handle type safety when dealing with external API responses in TypeScript?',
              expectedAnswerDetails: 'Candidate should discuss schema validation tools (e.g., Zod, Yup) or using type assertions/guards to validate external payloads before using them in code.',
              category: 'Technical - TypeScript'
            },
            {
              questionText: 'Tell me about a time you had to optimize a slow web application. What profiling tools and techniques did you use?',
              expectedAnswerDetails: 'Candidate should mention Chrome DevTools, React DevTools Profiler, Web Vitals, code splitting (React.lazy/Suspense), image optimization, or virtualization for long lists.',
              category: 'Performance'
            },
            {
              questionText: 'How do you structure CSS styles in a large React project, and how do you prevent style collisions?',
              expectedAnswerDetails: 'Look for discussion on CSS Modules, Styled Components/Emotion, TailwindCSS utility classes, or custom CSS custom properties, and their respective pros and cons.',
              category: 'UI/UX & Styling'
            }
          ],
          isFallbackExecution: false,
          createdAt: new Date().toISOString(),
        }
      }
      const { data } = await apiClient.get(`/api/ai/interview-questions/${applicationId}`)
      // Normalize schema across different API property casing and naming variations
      const questions = (data.questions || []).map((q: any) => {
        const questionText = q.question || q.Question || q.questionText || q.QuestionText || ''
        const category = q.type || q.Type || q.category || q.Category || 'Technical'
        const expectedAnswerDetails =
          q.expectedAnswerDetails ||
          q.ExpectedAnswerDetails ||
          q.expectedAnswer ||
          q.ExpectedAnswer ||
          (q.difficulty || q.Difficulty ? `Difficulty: ${q.difficulty || q.Difficulty}` : '') ||
          'Look for practical technical depth, clear problem-solving methodology, and past project examples.'

        return {
          questionText,
          expectedAnswerDetails,
          category,
        }
      })
      return { ...data, questions }
    },
    enabled: !!applicationId,
    retry: false,
  })

  // Mutation to generate questions
  const generateMutation = useMutation({
    mutationFn: async () => {
      if (applicationId.startsWith('demo')) {
        await new Promise((resolve) => setTimeout(resolve, 1500))
        generatedQuestionsApplications.add(applicationId)
        return { success: true }
      }
      // Fetch candidate profile to get real resume text/professional summary for better prompts
      let resumeText = 'Experience and credentials parsed from candidate profile details.'
      try {
        const appRes = await apiClient.get(`/api/v1/applications/${applicationId}`)
        const appData = appRes.data
        const profileRes = await apiClient.get(`/api/v1/candidates/profile/${appData.candidateProfileId}`)
        if (profileRes.data.professionalSummary) {
          resumeText = profileRes.data.professionalSummary
        }
      } catch (e) {
        console.error('Failed to get candidate resume summary for questions prompt', e)
      }

      const { data } = await apiClient.post('/api/ai/generate-interview-questions', {
        applicationId,
        jobTitle,
        jobDescription: jobDescription || 'Frontend Engineer with React, TypeScript and styling expertise.',
        resumeText,
      })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interview-questions', applicationId] })
      refetch()
    },
  })

  if (isLoading) return <Spinner label="Generating customized questions..." />

  if (isError || !questionSet || !questionSet.questions || questionSet.questions.length === 0) {
    return (
      <div className={`ai-glass-panel ${className}`}>
        <div className="text-center space-y-4 py-6">
          <div className="w-12 h-12 bg-m3/10 rounded-full flex items-center justify-center mx-auto text-m3">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-head">No AI Question Set Available</h3>
            <p className="text-xs text-muted mt-1">Generate tailored questions customized to the job title and candidate's experience.</p>
          </div>
          <button
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
            className="btn-ai-accent text-xs h-9 px-4 py-2"
          >
            {generateMutation.isPending ? 'Generating...' : 'Generate AI Questions'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`ai-glass-panel ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-line pb-4 mb-4">
        <div className="ai-glass-head mb-0">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M12 3l1.8 4.6L18 9l-4.2 1.4L12 15l-1.8-4.6L6 9l4.2-1.4L12 3z"/>
          </svg>
          <div>
            <b style={{ display: 'block', lineHeight: 1.2 }}>Gemini Co-pilot</b>
            <span className="text-[10px] text-muted font-normal">Custom Interview Questions for: {jobTitle}</span>
          </div>
        </div>
        <FallbackBadge isFallback={questionSet.isFallbackExecution} />
      </div>

      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
        {questionSet.questions.map((q, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl border border-line bg-panel-2/10 space-y-2 hover:border-accent/30 transition-all duration-150"
          >
            <div className="flex items-center justify-between">
              <span className="ai-badge-gemini text-[9px] px-2 py-0.5" style={{ background: 'rgba(123, 44, 191, 0.08)', color: '#7B2CBF' }}>
                {q.category}
              </span>
              <span className="text-[10px] font-mono text-muted">Question {idx + 1}</span>
            </div>
            <p className="text-xs font-semibold text-head leading-relaxed">"{q.questionText}"</p>
            <div className="text-[11px] text-text bg-panel/40 border border-line/50 p-2.5 rounded-lg">
              <span className="font-bold text-muted uppercase text-[9px] block mb-1">What to look for in the response:</span>
              <p className="italic text-muted">{q.expectedAnswerDetails}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 border-t border-line/50 pt-3.5 flex justify-end">
        <button
          onClick={() => generateMutation.mutate()}
          disabled={generateMutation.isPending}
          className="btn-ai-accent text-xs h-9 px-4 py-2"
        >
          {generateMutation.isPending ? 'Regenerating...' : 'Regenerate Questions'}
        </button>
      </div>
    </div>
  )
}

export default GenerateQuestionsPanel
