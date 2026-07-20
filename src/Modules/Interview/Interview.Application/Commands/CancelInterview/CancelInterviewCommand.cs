using MediatR;

namespace Interview.Application.Commands.CancelInterview;

/// <summary>
/// Soft-cancels an interview: the row is retained and its status moves to
/// <c>InterviewStatus.Cancelled</c> with the reason recorded. Never deletes.
/// </summary>
public class CancelInterviewCommand : IRequest
{
    public Guid InterviewId { get; set; }

    public string? CancellationReason { get; set; }
}
