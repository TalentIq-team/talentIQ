using Candidate.Domain.Exceptions;

namespace Candidate.Domain.Entities;

/// <summary>
/// Aggregate root representing a candidate's professional profile.
/// Owned by Member 3 (Candidate module).
/// </summary>
public class CandidateProfile
{
    private readonly List<CandidateSkill> _skills = new();

    public Guid Id { get; private set; }

    /// <summary>Identity module user this profile belongs to.</summary>
    public Guid UserId { get; private set; }

    public string ProfessionalSummary { get; private set; } = string.Empty;

    /// <summary>URL of the resume stored in Azure Blob Storage (FR-CD-02). Only the URL is persisted in SQL.</summary>
    public string? ResumeBlobUrl { get; private set; }

    public decimal YearsOfExperience { get; private set; }

    public DateTime CreatedAt { get; private set; }
    public DateTime UpdatedAt { get; private set; }

    public IReadOnlyCollection<CandidateSkill> Skills => _skills.AsReadOnly();

    // Required by EF Core.
    private CandidateProfile()
    {
    }

    public static CandidateProfile Create(
        Guid userId,
        string professionalSummary,
        decimal yearsOfExperience)
    {
        if (userId == Guid.Empty)
        {
            throw new CandidateDomainException("A candidate profile must belong to a valid user.");
        }

        Guard(professionalSummary, yearsOfExperience);

        var now = DateTime.UtcNow;
        return new CandidateProfile
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            ProfessionalSummary = professionalSummary.Trim(),
            YearsOfExperience = yearsOfExperience,
            CreatedAt = now,
            UpdatedAt = now
        };
    }

    public void UpdateDetails(string professionalSummary, decimal yearsOfExperience)
    {
        Guard(professionalSummary, yearsOfExperience);
        ProfessionalSummary = professionalSummary.Trim();
        YearsOfExperience = yearsOfExperience;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetResumeUrl(string resumeBlobUrl)
    {
        if (string.IsNullOrWhiteSpace(resumeBlobUrl))
        {
            throw new CandidateDomainException("Resume URL cannot be empty.");
        }

        ResumeBlobUrl = resumeBlobUrl;
        UpdatedAt = DateTime.UtcNow;
    }

    public void ReplaceSkills(IEnumerable<Guid> skillIds)
        => ReplaceSkills(skillIds.Select(id => new SkillAssignment(id, null)));

    /// <summary>Replaces the profile's skills, each with an optional proficiency level (FR-CD-01).</summary>
    public void ReplaceSkills(IEnumerable<SkillAssignment> skills)
    {
        _skills.Clear();
        foreach (var skill in skills.Where(s => s.SkillId != Guid.Empty)
                                    .GroupBy(s => s.SkillId)
                                    .Select(g => g.First()))
        {
            _skills.Add(new CandidateSkill(Id, skill.SkillId, skill.ProficiencyLevel));
        }

        UpdatedAt = DateTime.UtcNow;
    }

    private static void Guard(string professionalSummary, decimal yearsOfExperience)
    {
        if (string.IsNullOrWhiteSpace(professionalSummary))
        {
            throw new CandidateDomainException("Professional summary is required.");
        }

        if (yearsOfExperience < 0)
        {
            throw new CandidateDomainException("Years of experience cannot be negative.");
        }
    }
}
