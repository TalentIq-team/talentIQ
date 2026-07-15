using MediatR;
using Microsoft.EntityFrameworkCore;
using Recruitment.Application.Applications.Dtos;
using Recruitment.Application.Common.Interfaces;
using Recruitment.Domain.Entities;

namespace Recruitment.Application.Applications.Queries.SearchApplications;

/// <summary>
/// FR-RC-02: recruiter application search. Filters applications by stage, minimum AI match score,
/// job posting, and required skill (matched against the job's required skills, since skills live on
/// the job within this module's boundary).
/// </summary>
public record SearchApplicationsQuery(
    ApplicationStage? Stage = null,
    Guid? SkillId = null,
    decimal? MinScore = null,
    Guid? JobPostingId = null) : IRequest<IReadOnlyList<ApplicationDetailDto>>;

public class SearchApplicationsQueryHandler
    : IRequestHandler<SearchApplicationsQuery, IReadOnlyList<ApplicationDetailDto>>
{
    private readonly IRecruitmentDbContext _db;

    public SearchApplicationsQueryHandler(IRecruitmentDbContext db) => _db = db;

    public async Task<IReadOnlyList<ApplicationDetailDto>> Handle(SearchApplicationsQuery request, CancellationToken cancellationToken)
    {
        var query = _db.Applications
            .AsNoTracking()
            .Include(a => a.StageHistory)
            .AsQueryable();

        if (request.Stage is { } stage)
        {
            query = query.Where(a => a.Stage == stage);
        }

        if (request.JobPostingId is { } jobId && jobId != Guid.Empty)
        {
            query = query.Where(a => a.JobPostingId == jobId);
        }

        if (request.MinScore is { } minScore)
        {
            query = query.Where(a => a.AiMatchScore != null && a.AiMatchScore >= minScore);
        }

        if (request.SkillId is { } skillId && skillId != Guid.Empty)
        {
            var jobIdsRequiringSkill = _db.JobPostingSkills
                .Where(s => s.SkillId == skillId)
                .Select(s => s.JobPostingId);

            query = query.Where(a => jobIdsRequiringSkill.Contains(a.JobPostingId));
        }

        // Order in memory: decimal ORDER BY (AiMatchScore) is unsupported on some providers
        // (e.g. SQLite) though it works on SQL Server.
        var results = await query.ToListAsync(cancellationToken);

        return results
            .OrderByDescending(a => a.AiMatchScore.HasValue)
            .ThenByDescending(a => a.AiMatchScore)
            .ThenByDescending(a => a.AppliedAt)
            .Select(ApplicationDetailDto.FromEntity)
            .ToList();
    }
}
