import React, { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { apiClient, toErrorMessage } from '@/lib/api'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'

interface ScheduleInterviewModalProps {
  isOpen: boolean
  onClose: () => void
  applicationId: string
  candidateEmail: string
  onSuccess?: () => void
}

export const ScheduleInterviewModal: React.FC<ScheduleInterviewModalProps> = ({
  isOpen,
  onClose,
  applicationId,
  candidateEmail,
  onSuccess,
}) => {
  const [interviewerId, setInterviewerId] = useState('39b33a59-b1be-4974-9549-fb3d3876a8d6')
  const [startTime, setStartTime] = useState('')
  const [meetingLink, setMeetingLink] = useState('https://meet.google.com/abc-defg-hij')
  const [error, setError] = useState<string | null>(null)

  const interviewers = [
    { value: '39b33a59-b1be-4974-9549-fb3d3876a8d6', label: 'Mary (Hiring Manager) - manager@talentiq.dev' },
    { value: '7c9e66ab-1d4e-48a0-bb82-628d689622d1', label: 'Alex (Tech Lead) - alex.tech@talentiq.dev' },
    { value: 'e6fb4c43-85f2-45e0-b6ab-e1293fb0a612', label: 'Sarah (Director) - sarah.ops@talentiq.dev' },
  ]

  const scheduleMutation = useMutation({
    mutationFn: async () => {
      setError(null)
      const command = {
        applicationId,
        interviewerUserId: interviewerId,
        scheduledStartTime: new Date(startTime).toISOString(),
        meetingLink,
        candidateEmail,
      }
      await apiClient.post('/api/Interview/schedule', command)
    },
    onSuccess: () => {
      onClose()
      if (onSuccess) onSuccess()
    },
    onError: (err) => {
      setError(toErrorMessage(err))
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!startTime) {
      setError('Please select a start time.')
      return
    }
    scheduleMutation.mutate()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Schedule Candidate Interview">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-xl border border-alert/20 bg-alert/5 p-3 text-xs text-alert">
            {error}
          </div>
        )}

        <Input
          label="Candidate Email"
          type="email"
          disabled
          value={candidateEmail}
          onChange={() => {}}
        />

        <Select
          label="Assign Interviewer"
          options={interviewers}
          value={interviewerId}
          onChange={(e) => setInterviewerId(e.target.value)}
        />

        <Input
          label="Scheduled Start Time"
          type="datetime-local"
          required
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
        />

        <Input
          label="Video Meeting Link"
          type="url"
          required
          placeholder="e.g. https://meet.google.com/xxx-yyyy-zzz"
          value={meetingLink}
          onChange={(e) => setMeetingLink(e.target.value)}
        />

        <div className="flex justify-end gap-3 pt-3 border-t border-line/45">
          <Button type="button" variant="outline" onClick={onClose} size="sm">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={scheduleMutation.isPending}
          >
            Schedule Interview
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default ScheduleInterviewModal
