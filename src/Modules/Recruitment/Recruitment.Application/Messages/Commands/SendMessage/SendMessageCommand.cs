using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Recruitment.Application.Common.Interfaces;
using Recruitment.Application.Messages.Dtos;
using Recruitment.Application.Messages.Events;
using Recruitment.Domain.Entities;
using TalentIQ.Shared.Kernel.Exceptions;
using ApplicationEntity = Recruitment.Domain.Entities.Application;

namespace Recruitment.Application.Messages.Commands.SendMessage;

/// <summary>FR-RC-04: send a message against an application (recruiter ↔ applicant).</summary>
public record SendMessageCommand(Guid ApplicationId, Guid SenderUserId, string Body) : IRequest<MessageDto>;

public class SendMessageCommandValidator : AbstractValidator<SendMessageCommand>
{
    public SendMessageCommandValidator()
    {
        RuleFor(x => x.ApplicationId).NotEmpty();
        RuleFor(x => x.Body).NotEmpty().MaximumLength(4000);
    }
}

public class SendMessageCommandHandler : IRequestHandler<SendMessageCommand, MessageDto>
{
    private readonly IRecruitmentDbContext _db;
    private readonly IPublisher _publisher;

    public SendMessageCommandHandler(IRecruitmentDbContext db, IPublisher publisher)
    {
        _db = db;
        _publisher = publisher;
    }

    public async Task<MessageDto> Handle(SendMessageCommand request, CancellationToken cancellationToken)
    {
        var applicationExists = await _db.Applications
            .AnyAsync(a => a.Id == request.ApplicationId, cancellationToken);

        if (!applicationExists)
        {
            throw new NotFoundException(nameof(ApplicationEntity), request.ApplicationId);
        }

        var message = Message.Create(request.ApplicationId, request.SenderUserId, request.Body);
        _db.Messages.Add(message);
        await _db.SaveChangesAsync(cancellationToken);

        // Publish only — the Notification module (other member) decides how to deliver it.
        await _publisher.Publish(
            new MessageSentEvent(message.Id, message.ApplicationId, message.SenderUserId, message.SentAt),
            cancellationToken);

        return MessageDto.FromEntity(message);
    }
}
