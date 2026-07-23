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

        var jobPostingIds = applications.Select(a => a.JobPostingId).Distinct().ToList();
        var jobTitles = await _db.JobPostings
            .AsNoTracking()
            .Where(j => jobPostingIds.Contains(j.Id))
            .Select(j => new { j.Id, j.Title })
            .ToDictionaryAsync(j => j.Id, j => j.Title, cancellationToken);

        return applications
            .Select(a => ApplicationDetailDto.FromEntity(a).WithJobTitle(
                jobTitles.TryGetValue(a.JobPostingId, out var title) ? title : null))
            .ToList();
    }
}