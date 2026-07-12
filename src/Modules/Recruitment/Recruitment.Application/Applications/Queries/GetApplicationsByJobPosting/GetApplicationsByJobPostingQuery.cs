using MediatR;
using Microsoft.EntityFrameworkCore;
using Recruitment.Application.Applications.Dtos;
using Recruitment.Application.Common.Interfaces;

namespace Recruitment.Application.Applications.Queries.GetApplicationsByJobPosting;

/// <summary>
/// Recruiter candidate-pipeline view: all applications for a given job posting,
/// ordered by AI match score (nulls last) then application date.
/// </summary>
public record GetApplicationsByJobPostingQuery(Guid JobPostingId)
    : IRequest<IReadOnlyList<ApplicationDetailDto>>;

public class GetApplicationsByJobPostingQueryHandler
    : IRequestHandler<GetApplicationsByJobPostingQuery, IReadOnlyList<ApplicationDetailDto>>
{
    private readonly IRecruitmentDbContext _db;

    public GetApplicationsByJobPostingQueryHandler(IRecruitmentDbContext db) => _db = db;

    public async Task<IReadOnlyList<ApplicationDetailDto>> Handle(GetApplicationsByJobPostingQuery request, CancellationToken cancellationToken)
    {
        var applications = await _db.Applications
            .AsNoTracking()
            .Include(a => a.StageHistory)
            .Where(a => a.JobPostingId == request.JobPostingId)
            .OrderByDescending(a => a.AiMatchScore.HasValue)
            .ThenByDescending(a => a.AiMatchScore)
            .ThenByDescending(a => a.AppliedAt)
            .ToListAsync(cancellationToken);

        return applications.Select(ApplicationDetailDto.FromEntity).ToList();
    }
}
