using Recruitment.Domain.Entities;

namespace Recruitment.Application.Messages.Dtos;

public record MessageDto(
    Guid Id,
    Guid ApplicationId,
    Guid SenderUserId,
    string Body,
    DateTime SentAt)
{
    public static MessageDto FromEntity(Message m) =>
        new(m.Id, m.ApplicationId, m.SenderUserId, m.Body, m.SentAt);
}
