namespace Interview.Application.Commands.RescheduleInterview;

public class RescheduleInterviewCommand
{
    public Guid InterviewId { get; set; }

    public DateTime NewScheduledTime { get; set; }

    public string NewMeetingLink { get; set; } = string.Empty;
}