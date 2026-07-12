using MediatR;
using Microsoft.EntityFrameworkCore;
using Recruitment.Application.Applications.Dtos;
using Recruitment.Application.Common.Interfaces;

namespace Recruitment.Application.Applications.Queries.GetApplicationsByCandidate;

/// <summary>
/// FR-CD-05: application tracker — all applications for a candidate, each with its
/// current stage and full stage history.
/// </summary>
public record GetApplicationsByCandidateQuery(Guid CandidateProfileId)
    : IRequest<IReadOnlyList<ApplicationDetailDto>>;

public class GetApplicationsByCandidateQueryHandler
    : IRequestHandler<GetApplicationsByCandidateQuery, IReadOnlyList<ApplicationDetailDto>>
{
    private readonly IRecruitmentDbContext _db;

    public GetApplicationsByCandidateQueryHandler(IRecruitmentDbContext db) => _db = db;

    public async Task<IReadOnlyList<ApplicationDetailDto>> Handle(GetApplicationsByCandidateQuery request, CancellationToken cancellationToken)
    {
        var applications = await _db.Applications
            .AsNoTracking()
            .Include(a => a.StageHistory)
            .Where(a => a.CandidateProfileId == request.CandidateProfileId)
            .OrderByDescending(a => a.AppliedAt)
            .ToListAsync(cancellationToken);

        return applications.Select(ApplicationDetailDto.FromEntity).ToList();
    }
}
