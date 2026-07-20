using MediatR;

namespace Interview.Application.Commands.ScheduleInterview;

public class ScheduleInterviewCommand : IRequest<Guid>
{
    public Guid ApplicationId { get; set; }

    public Guid InterviewerUserId { get; set; }

    public DateTime ScheduledStartTime { get; set; }

    public string MeetingLink { get; set; } = string.Empty;

    public string CandidateEmail { get; set; } = string.Empty;
}
