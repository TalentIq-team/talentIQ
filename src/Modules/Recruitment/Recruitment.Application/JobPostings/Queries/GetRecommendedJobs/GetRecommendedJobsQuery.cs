using MediatR;
using Microsoft.EntityFrameworkCore;
using Recruitment.Application.Common.Interfaces;
using Recruitment.Domain.Entities;

namespace Recruitment.Application.JobPostings.Queries.GetRecommendedJobs;

/// <summary>A recommended job for a candidate, scored by deterministic skill overlap (FR-CD-06).</summary>
public record JobRecommendationDto(
    Guid JobId,
    string Title,
    int MatchPercentage,
    IReadOnlyList<Guid> MatchedSkills);

/// <summary>
/// FR-CD-06: recommends PUBLISHED jobs to a candidate by overlapping the candidate's skill ids with
/// each job's required skills. Deterministic (no ML) — a clean fallback when the AI module is absent.
/// </summary>
public record GetRecommendedJobsQuery(IReadOnlyList<Guid> CandidateSkillIds)
    : IRequest<IReadOnlyList<JobRecommendationDto>>;

public class GetRecommendedJobsQueryHandler
    : IRequestHandler<GetRecommendedJobsQuery, IReadOnlyList<JobRecommendationDto>>
{
    private readonly IRecruitmentDbContext _db;

    public GetRecommendedJobsQueryHandler(IRecruitmentDbContext db) => _db = db;

    public async Task<IReadOnlyList<JobRecommendationDto>> Handle(GetRecommendedJobsQuery request, CancellationToken cancellationToken)
    {
        var candidateSkills = request.CandidateSkillIds?.ToHashSet() ?? new HashSet<Guid>();
        if (candidateSkills.Count == 0)
        {
            return Array.Empty<JobRecommendationDto>();
        }

        var jobs = await _db.JobPostings
            .AsNoTracking()
            .Include(j => j.Skills)
            .Where(j => j.Status == JobPostingStatus.Published)
            .ToListAsync(cancellationToken);

        var recommendations = new List<JobRecommendationDto>();
        foreach (var job in jobs)
        {
            var required = job.Skills.Select(s => s.SkillId).ToList();
            if (required.Count == 0)
            {
                continue;
            }

            var matched = required.Where(candidateSkills.Contains).ToList();
            if (matched.Count == 0)
            {
                continue;
            }

            var percentage = (int)Math.Round(matched.Count * 100.0 / required.Count);
            recommendations.Add(new JobRecommendationDto(job.Id, job.Title, percentage, matched));
        }

        return recommendations
            .OrderByDescending(r => r.MatchPercentage)
            .ThenBy(r => r.Title)
            .ToList();
    }
}
