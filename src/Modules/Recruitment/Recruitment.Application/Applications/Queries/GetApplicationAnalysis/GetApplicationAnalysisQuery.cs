using MediatR;
using Microsoft.EntityFrameworkCore;
using Recruitment.Application.Applications.Dtos;
using Recruitment.Application.Common.Interfaces;
using TalentIQ.Shared.Kernel.Exceptions;

namespace Recruitment.Application.Applications.Queries.GetApplicationAnalysis;

/// <summary>FR-RC-05: retrieve the stored resume-analysis result for an application.</summary>
public record GetApplicationAnalysisQuery(Guid ApplicationId) : IRequest<ApplicationAnalysisDto>;

public class GetApplicationAnalysisQueryHandler : IRequestHandler<GetApplicationAnalysisQuery, ApplicationAnalysisDto>
{
    private readonly IRecruitmentDbContext _db;

    public GetApplicationAnalysisQueryHandler(IRecruitmentDbContext db) => _db = db;

    public async Task<ApplicationAnalysisDto> Handle(GetApplicationAnalysisQuery request, CancellationToken cancellationToken)
    {
        var analysis = await _db.ApplicationAnalyses
            .AsNoTracking()
            .FirstOrDefaultAsync(a => a.ApplicationId == request.ApplicationId, cancellationToken)
            ?? throw new NotFoundException("ApplicationAnalysis", request.ApplicationId);

        return ApplicationAnalysisDto.FromEntity(analysis);
    }
}
