using Candidate.Application.Candidates.Dtos;
using Candidate.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Candidate.Application.Candidates.Queries.SearchCandidates;

/// <summary>
/// FR-RC-02: recruiter candidate search. Filters candidate profiles by skill (name or id) and
/// minimum years of experience. (Candidate profiles carry no location field, so location is not a
/// supported filter here.)
/// </summary>
public record SearchCandidatesQuery(
    string? Skill = null,
    Guid? SkillId = null,
    decimal? MinYearsOfExperience = null) : IRequest<IReadOnlyList<CandidateProfileDto>>;

public class SearchCandidatesQueryHandler
    : IRequestHandler<SearchCandidatesQuery, IReadOnlyList<CandidateProfileDto>>
{
    private readonly ICandidateDbContext _db;

    public SearchCandidatesQueryHandler(ICandidateDbContext db) => _db = db;

    public async Task<IReadOnlyList<CandidateProfileDto>> Handle(SearchCandidatesQuery request, CancellationToken cancellationToken)
    {
        var query = _db.CandidateProfiles
            .AsNoTracking()
            .Include(p => p.Skills)
            .AsQueryable();

        if (request.MinYearsOfExperience is { } minExp)
        {
            query = query.Where(p => p.YearsOfExperience >= minExp);
        }

        if (request.SkillId is { } skillId && skillId != Guid.Empty)
        {
            query = query.Where(p => p.Skills.Any(s => s.SkillId == skillId));
        }

        if (!string.IsNullOrWhiteSpace(request.Skill))
        {
            var skillName = request.Skill.Trim();

            // Resolve skill ids whose name matches, then keep profiles that declare any of them.
            var matchingSkillIds = _db.Skills
                .Where(s => EF.Functions.Like(s.Name, $"%{skillName}%"))
                .Select(s => s.Id);

            query = query.Where(p => p.Skills.Any(cs => matchingSkillIds.Contains(cs.SkillId)));
        }

        // Filter in the database, but order in memory: decimal ORDER BY is unsupported on some
        // providers (e.g. SQLite) though it works on SQL Server. Candidate result sets are small.
        var results = await query.ToListAsync(cancellationToken);

        return results
            .OrderByDescending(p => p.YearsOfExperience)
            .Select(CandidateProfileDto.FromEntity)
            .ToList();
    }
}
