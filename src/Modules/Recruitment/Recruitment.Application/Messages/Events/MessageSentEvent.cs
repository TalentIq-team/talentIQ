using MediatR;

namespace Recruitment.Application.Messages.Events;

/// <summary>
/// Published (via MediatR) when a message is sent against an application (FR-RC-04).
/// This is the clean integration point for the Notification module (email/push), which is
/// owned by ANOTHER member and intentionally NOT implemented here — this module only publishes.
/// </summary>
public record MessageSentEvent(
    Guid MessageId,
    Guid ApplicationId,
    Guid SenderUserId,
    DateTime SentAt) : INotification;
