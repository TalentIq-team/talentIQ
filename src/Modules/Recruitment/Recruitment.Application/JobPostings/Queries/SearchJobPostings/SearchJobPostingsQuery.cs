using MediatR;
using Microsoft.EntityFrameworkCore;
using Recruitment.Application.Common.Interfaces;
using Recruitment.Application.JobPostings.Dtos;
using Recruitment.Domain.Entities;

namespace Recruitment.Application.JobPostings.Queries.SearchJobPostings;

/// <summary>
/// FR-CD-03: search OPEN (Published) job postings, optionally filtered by
/// title, skill, location and employment type.
/// </summary>
public record SearchJobPostingsQuery(
    string? Title = null,
    Guid? SkillId = null,
    string? Location = null,
    EmploymentType? EmploymentType = null) : IRequest<IReadOnlyList<JobPostingDto>>;

public class SearchJobPostingsQueryHandler
    : IRequestHandler<SearchJobPostingsQuery, IReadOnlyList<JobPostingDto>>
{
    private readonly IRecruitmentDbContext _db;

    public SearchJobPostingsQueryHandler(IRecruitmentDbContext db) => _db = db;

    public async Task<IReadOnlyList<JobPostingDto>> Handle(SearchJobPostingsQuery request, CancellationToken cancellationToken)
    {
        var query = _db.JobPostings
            .AsNoTracking()
            .Include(j => j.Skills)
            .Where(j => j.Status == JobPostingStatus.Published);

        if (!string.IsNullOrWhiteSpace(request.Title))
        {
            var title = request.Title.Trim();
            query = query.Where(j => EF.Functions.Like(j.Title, $"%{title}%"));
        }

        if (!string.IsNullOrWhiteSpace(request.Location))
        {
            var location = request.Location.Trim();
            query = query.Where(j => EF.Functions.Like(j.Location, $"%{location}%"));
        }

        if (request.EmploymentType is not null)
        {
            query = query.Where(j => j.EmploymentType == request.EmploymentType);
        }

        if (request.SkillId is not null && request.SkillId != Guid.Empty)
        {
            query = query.Where(j => j.Skills.Any(s => s.SkillId == request.SkillId));
        }

        var results = await query
            .OrderByDescending(j => j.PublishedAt)
            .ToListAsync(cancellationToken);

        return results.Select(JobPostingDto.FromEntity).ToList();
    }
}
