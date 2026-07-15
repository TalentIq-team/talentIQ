using MediatR;
using Microsoft.EntityFrameworkCore;
using Recruitment.Application.Applications.Dtos;
using Recruitment.Application.Common.Interfaces;
using Recruitment.Domain.Entities;
using TalentIQ.Shared.Kernel.Exceptions;

namespace Recruitment.Application.Applications.Queries.GetApplicationById;

/// <summary>Get a single application with its full stage history.</summary>
public record GetApplicationByIdQuery(Guid Id) : IRequest<ApplicationDetailDto>;

public class GetApplicationByIdQueryHandler : IRequestHandler<GetApplicationByIdQuery, ApplicationDetailDto>
{
    private readonly IRecruitmentDbContext _db;

    public GetApplicationByIdQueryHandler(IRecruitmentDbContext db) => _db = db;

    public async Task<ApplicationDetailDto> Handle(GetApplicationByIdQuery request, CancellationToken cancellationToken)
    {
        var application = await _db.Applications
            .AsNoTracking()
            .Include(a => a.StageHistory)
            .FirstOrDefaultAsync(a => a.Id == request.Id, cancellationToken)
            ?? throw new NotFoundException("Application", request.Id);

        return ApplicationDetailDto.FromEntity(application);
    }
}
