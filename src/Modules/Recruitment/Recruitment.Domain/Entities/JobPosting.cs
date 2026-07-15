using Recruitment.Domain.Exceptions;

namespace Recruitment.Domain.Entities;

/// <summary>
/// Aggregate root representing a recruiter's job posting.
/// Recruiters can create, edit, publish and close postings.
/// </summary>
public class JobPosting
{
    private readonly List<JobPostingSkill> _skills = new();

    public Guid Id { get; private set; }
    public Guid OrganizationId { get; private set; }
    public Guid RecruiterId { get; private set; }

    public string Title { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;
    public string Location { get; private set; } = string.Empty;
    public EmploymentType EmploymentType { get; private set; }
    public JobPostingStatus Status { get; private set; }
    public int MinExperienceYears { get; private set; }

    public DateTime CreatedAt { get; private set; }
    public DateTime UpdatedAt { get; private set; }
    public DateTime? PublishedAt { get; private set; }
    public DateTime? ClosedAt { get; private set; }

    public IReadOnlyCollection<JobPostingSkill> Skills => _skills.AsReadOnly();

    // Required by EF Core.
    private JobPosting()
    {
    }

    public static JobPosting Create(
        Guid organizationId,
        Guid recruiterId,
        string title,
        string description,
        string location,
        EmploymentType employmentType,
        int minExperienceYears)
    {
        if (organizationId == Guid.Empty)
        {
            throw new RecruitmentDomainException("A job posting must belong to an organization.");
        }

        if (recruiterId == Guid.Empty)
        {
            throw new RecruitmentDomainException("A job posting must have a recruiter.");
        }

        Guard(title, minExperienceYears);

        var now = DateTime.UtcNow;
        return new JobPosting
        {
            Id = Guid.NewGuid(),
            OrganizationId = organizationId,
            RecruiterId = recruiterId,
            Title = title.Trim(),
            Description = description?.Trim() ?? string.Empty,
            Location = location?.Trim() ?? string.Empty,
            EmploymentType = employmentType,
            MinExperienceYears = minExperienceYears,
            Status = JobPostingStatus.Draft,
            CreatedAt = now,
            UpdatedAt = now
        };
    }

    public void UpdateDetails(
        string title,
        string description,
        string location,
        EmploymentType employmentType,
        int minExperienceYears)
    {
        if (Status == JobPostingStatus.Closed)
        {
            throw new RecruitmentDomainException("A closed job posting cannot be edited.");
        }

        Guard(title, minExperienceYears);
        Title = title.Trim();
        Description = description?.Trim() ?? string.Empty;
        Location = location?.Trim() ?? string.Empty;
        EmploymentType = employmentType;
        MinExperienceYears = minExperienceYears;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Publish()
    {
        if (Status == JobPostingStatus.Published)
        {
            return;
        }

        if (Status == JobPostingStatus.Closed)
        {
            throw new RecruitmentDomainException("A closed job posting cannot be published.");
        }

        Status = JobPostingStatus.Published;
        PublishedAt = DateTime.UtcNow;
        UpdatedAt = PublishedAt.Value;
    }

    public void Close()
    {
        if (Status == JobPostingStatus.Closed)
        {
            return;
        }

        Status = JobPostingStatus.Closed;
        ClosedAt = DateTime.UtcNow;
        UpdatedAt = ClosedAt.Value;
    }

    public void ReplaceSkills(IEnumerable<Guid> skillIds)
    {
        _skills.Clear();
        foreach (var skillId in skillIds.Distinct())
        {
            if (skillId == Guid.Empty)
            {
                continue;
            }

            _skills.Add(new JobPostingSkill(Id, skillId));
        }

        UpdatedAt = DateTime.UtcNow;
    }

    private static void Guard(string title, int minExperienceYears)
    {
        if (string.IsNullOrWhiteSpace(title))
        {
            throw new RecruitmentDomainException("Job title is required.");
        }

        if (minExperienceYears < 0)
        {
            throw new RecruitmentDomainException("Minimum experience years cannot be negative.");
        }
    }
}
