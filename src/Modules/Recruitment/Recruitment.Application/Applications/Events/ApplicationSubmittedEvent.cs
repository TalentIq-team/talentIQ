using MediatR;

namespace Recruitment.Application.Applications.Events;

/// <summary>
/// Published (via MediatR) when a candidate submits an application (FR-CD-04).
/// Downstream consumers (AI scoring, notifications, analytics) are owned by OTHER members
/// and are intentionally NOT implemented here — this module only publishes the event.
/// </summary>
public record ApplicationSubmittedEvent(
    Guid ApplicationId,
    Guid JobPostingId,
    Guid CandidateProfileId,
    DateTime AppliedAt) : INotification;
