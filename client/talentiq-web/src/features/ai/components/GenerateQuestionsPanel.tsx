import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { Spinner, ErrorBanner } from '@/components/Feedback'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import FallbackBadge from './FallbackBadge'

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
      const { data } = await apiClient.get(`/api/ai/interview-questions/${applicationId}`)
      // Normalize schema if key is 'questionText' or similar
      const questions = (data.questions || []).map((q: any) => ({
        questionText: q.Question || q.questionText || q.QuestionText || '',
        expectedAnswerDetails: q.ExpectedAnswer || q.expectedAnswerDetails || q.ExpectedAnswerDetails || '',
        category: q.Category || q.category || 'Technical',
      }))
      return { ...data, questions }
    },
    enabled: !!applicationId,
    retry: false,
  })

  // Mutation to generate questions
  const generateMutation = useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post('/api/ai/generate-interview-questions', {
        applicationId,
        jobTitle,
        jobDescription,
        resumeText: 'Experience and credentials parsed from candidate profile details.',
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
      <Card variant="glass" className={`p-6 border border-line ${className}`}>
        <div className="text-center space-y-4 py-6">
          <div className="w-12 h-12 bg-m3/10 rounded-full flex items-center justify-center mx-auto text-m3">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-head">No AI Question Set Available</h3>
            <p className="text-xs text-muted mt-1">Generate tailored questions customized to the job title and candidate's experience.</p>
          </div>
          <Button
            size="sm"
            onClick={() => generateMutation.mutate()}
            isLoading={generateMutation.isPending}
            variant="primary"
          >
            Generate AI Questions
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card variant="glass" className={`p-6 border border-line ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-line pb-4 mb-4">
        <div>
          <h3 className="text-sm font-bold text-head uppercase tracking-wider">AI Tailored Interview Questions</h3>
          <p className="text-[10px] text-muted mt-0.5">
            Tailored for: {jobTitle}
          </p>
        </div>
        <FallbackBadge isFallback={questionSet.isFallbackExecution} />
      </div>

      <div className="space-y-4">
        {questionSet.questions.map((q, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl border border-line bg-panel-2/20 space-y-2 hover:border-m3/30 transition-all duration-150"
          >
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold uppercase tracking-wider text-m3 px-2 py-0.5 rounded-md bg-m3/10 border border-m3/10">
                {q.category}
              </span>
              <span className="text-[10px] font-medium text-muted">Question {idx + 1}</span>
            </div>
            <p className="text-xs font-semibold text-head leading-relaxed">{q.questionText}</p>
            <div className="text-[11px] text-text bg-panel/30 border border-line/40 p-2.5 rounded-lg">
              <span className="font-bold text-muted uppercase text-[9px] block mb-1">What to look for:</span>
              <p className="italic text-muted">{q.expectedAnswerDetails}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 border-t border-line/50 pt-3.5 flex justify-end">
        <Button
          size="sm"
          onClick={() => generateMutation.mutate()}
          isLoading={generateMutation.isPending}
          variant="outline"
          className="text-xs h-9"
        >
          Regenerate Questions
        </Button>
      </div>
    </Card>
  )
}

export default GenerateQuestionsPanel
