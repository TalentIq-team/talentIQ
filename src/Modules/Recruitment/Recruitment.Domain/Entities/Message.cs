using Recruitment.Domain.Exceptions;

namespace Recruitment.Domain.Entities;

/// <summary>
/// A message exchanged in the context of an application (FR-RC-04). A recruiter (or applicant)
/// posts a message against an application; the thread is retrieved per application.
/// </summary>
public class Message
{
    public Guid Id { get; private set; }
    public Guid ApplicationId { get; private set; }

    /// <summary>Identity user who sent the message (recruiter or applicant).</summary>
    public Guid SenderUserId { get; private set; }

    public string Body { get; private set; } = string.Empty;
    public DateTime SentAt { get; private set; }

    // Required by EF Core.
    private Message()
    {
    }

    public static Message Create(Guid applicationId, Guid senderUserId, string body)
    {
        if (applicationId == Guid.Empty)
        {
            throw new RecruitmentDomainException("A message must reference an application.");
        }

        if (string.IsNullOrWhiteSpace(body))
        {
            throw new RecruitmentDomainException("Message body cannot be empty.");
        }

        return new Message
        {
            Id = Guid.NewGuid(),
            ApplicationId = applicationId,
            SenderUserId = senderUserId,
            Body = body.Trim(),
            SentAt = DateTime.UtcNow
        };
    }
}
