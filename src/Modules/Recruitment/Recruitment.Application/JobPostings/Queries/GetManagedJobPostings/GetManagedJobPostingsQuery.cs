using MediatR;
using Microsoft.EntityFrameworkCore;
using Recruitment.Application.Common.Interfaces;
using Recruitment.Application.JobPostings.Dtos;

namespace Recruitment.Application.JobPostings.Queries.GetManagedJobPostings;

/// <summary>
/// Returns all job postings for the authenticated recruiter workspace,
/// including Draft, Published, and Closed postings.
/// </summary>
public sealed record GetManagedJobPostingsQuery
    : IRequest<IReadOnlyList<JobPostingDto>>;

public sealed class GetManagedJobPostingsQueryHandler
    : IRequestHandler<
        GetManagedJobPostingsQuery,
        IReadOnlyList<JobPostingDto>>
{
    private readonly IRecruitmentDbContext _db;

    public GetManagedJobPostingsQueryHandler(
        IRecruitmentDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyList<JobPostingDto>> Handle(
        GetManagedJobPostingsQuery request,
        CancellationToken cancellationToken)
    {
        var jobs = await _db.JobPostings
            .AsNoTracking()
            .Include(job => job.Skills)
            .OrderByDescending(job => job.CreatedAt)
            .ToListAsync(cancellationToken);

        return jobs
            .Select(JobPostingDto.FromEntity)
            .ToList();
    }
}
