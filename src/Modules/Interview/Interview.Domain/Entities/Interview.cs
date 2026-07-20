namespace Interview.Domain.Entities;

public class Interview
{
    public Guid Id { get; set; }
    public Guid ApplicationId { get; set; }
    public DateTime ScheduledStartTime { get; set; }
    public Guid InterviewerUserId { get; set; }
    public string MeetingLink { get; set; } = string.Empty;
    public InterviewStatus Status { get; set; }

    /// <summary>Set when the interview is soft-cancelled. Records are never deleted.</summary>
    public string? CancellationReason { get; set; }
    public DateTime? CancelledAt { get; set; }
}
