using MediatR;
using Microsoft.EntityFrameworkCore;
using Recruitment.Application.Common.Interfaces;
using Recruitment.Application.Messages.Dtos;

namespace Recruitment.Application.Messages.Queries.GetMessagesByApplication;

/// <summary>FR-RC-04: message history for an application, oldest first.</summary>
public record GetMessagesByApplicationQuery(Guid ApplicationId) : IRequest<IReadOnlyList<MessageDto>>;

public class GetMessagesByApplicationQueryHandler
    : IRequestHandler<GetMessagesByApplicationQuery, IReadOnlyList<MessageDto>>
{
    private readonly IRecruitmentDbContext _db;

    public GetMessagesByApplicationQueryHandler(IRecruitmentDbContext db) => _db = db;

    public async Task<IReadOnlyList<MessageDto>> Handle(GetMessagesByApplicationQuery request, CancellationToken cancellationToken)
    {
        var messages = await _db.Messages
            .AsNoTracking()
            .Where(m => m.ApplicationId == request.ApplicationId)
            .OrderBy(m => m.SentAt)
            .ToListAsync(cancellationToken);

        return messages.Select(MessageDto.FromEntity).ToList();
    }
}
