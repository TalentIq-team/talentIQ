using Recruitment.Domain.Entities;

namespace Recruitment.Application.JobPostings.Dtos;

public record JobPostingDto(
    Guid Id,
    Guid OrganizationId,
    Guid RecruiterId,
    string Title,
    string Description,
    string Location,
    EmploymentType EmploymentType,
    JobPostingStatus Status,
    int MinExperienceYears,
    IReadOnlyList<Guid> SkillIds,
    DateTime CreatedAt,
    DateTime? PublishedAt,
    DateTime? ClosedAt)
{
    public static JobPostingDto FromEntity(JobPosting job) => new(
        job.Id,
        job.OrganizationId,
        job.RecruiterId,
        job.Title,
        job.Description,
        job.Location,
        job.EmploymentType,
        job.Status,
        job.MinExperienceYears,
        job.Skills.Select(s => s.SkillId).ToList(),
        job.CreatedAt,
        job.PublishedAt,
        job.ClosedAt);
}
