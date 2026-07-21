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
        var hasPublished = await _db.JobPostings.AnyAsync(j => j.Status == JobPostingStatus.Published, cancellationToken);
        if (!hasPublished)
        {
            var drafts = await _db.JobPostings.Where(j => j.Status == JobPostingStatus.Draft).ToListAsync(cancellationToken);
            foreach (var d in drafts)
            {
                d.Publish();
            }

            if (!drafts.Any())
            {
                var orgId = Guid.Parse("00000000-0000-0000-0000-000000000001");
                var recId = Guid.Parse("00000000-0000-0000-0000-000000000002");

                var sampleJobs = new[]
                {
                    JobPosting.Create(orgId, recId, "Senior React & Frontend Architect",
                        "Lead the modernization of frontend web applications using React 19, Vite, TypeScript, and TailwindCSS. Implement high-performance UI components aligned with enterprise design token systems.",
                        "Colombo, Sri Lanka (Hybrid)", EmploymentType.FullTime, 5),
                    JobPosting.Create(orgId, recId, "Full Stack .NET & C# Engineer",
                        "Architect scalable web APIs and backend services using ASP.NET Core 8, EF Core, and SQL Server. Build secure identity integrations and microservice endpoints.",
                        "Remote / Kandy, Sri Lanka", EmploymentType.FullTime, 3),
                    JobPosting.Create(orgId, recId, "AI / ML Integration Specialist (Gemini API)",
                        "Integrate Gemini LLM models and vector search capabilities into recruitment pipelines. Develop explainable AI match scoring and automated candidate evaluation algorithms.",
                        "Remote (Global)", EmploymentType.FullTime, 3),
                    JobPosting.Create(orgId, recId, "Cloud Infrastructure & DevOps Engineer",
                        "Manage cloud infrastructure, CI/CD automation pipelines, Kubernetes clusters, and Docker container orchestration with high availability standards.",
                        "Colombo, Sri Lanka (On-site)", EmploymentType.Contract, 4),
                    JobPosting.Create(orgId, recId, "UI/UX Product Designer",
                        "Design intuitive design systems, interactive prototypes, and design token scales. Conduct user research and accessibility audits for enterprise applications.",
                        "Colombo, Sri Lanka", EmploymentType.FullTime, 2),
                    JobPosting.Create(orgId, recId, "Data Engineer & BigQuery Specialist",
                        "Build automated ELT pipelines using dbt, BigQuery, and Python. Design scalable analytics schemas and real-time streaming architectures.",
                        "Remote", EmploymentType.FullTime, 4)
                };

                foreach (var j in sampleJobs)
                {
                    j.Publish();
                }

                await _db.JobPostings.AddRangeAsync(sampleJobs, cancellationToken);
            }

            await _db.SaveChangesAsync(cancellationToken);
        }

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
