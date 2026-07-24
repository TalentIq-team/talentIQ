namespace Candidate.Domain.Entities;

/// <summary>
/// Join entity linking a <see cref="CandidateProfile"/> to a <see cref="Skill"/> (many-to-many).
/// </summary>
public class CandidateSkill
{
    public Guid CandidateProfileId { get; private set; }
    public Guid SkillId { get; private set; }

    /// <summary>Optional self-declared proficiency (e.g. Beginner, Intermediate, Advanced, Expert).</summary>
    public string? ProficiencyLevel { get; private set; }

    /// <summary>Skill Category (e.g. Frontend, Backend, Cloud, Management).</summary>
    public string? Category { get; private set; }

    /// <summary>Years of hands-on experience using this skill.</summary>
    public decimal? YearsOfExperience { get; private set; }

    /// <summary>Year or date last used (e.g. 2026).</summary>
    public string? LastUsed { get; private set; }

    public CandidateProfile? CandidateProfile { get; private set; }
    public Skill? Skill { get; private set; }

    // Required by EF Core.
    private CandidateSkill()
    {
    }

    public CandidateSkill(
        Guid candidateProfileId,
        Guid skillId,
        string? proficiencyLevel = null,
        string? category = null,
        decimal? yearsOfExperience = null,
        string? lastUsed = null)
    {
        CandidateProfileId = candidateProfileId;
        SkillId = skillId;
        ProficiencyLevel = proficiencyLevel;
        Category = category;
        YearsOfExperience = yearsOfExperience;
        LastUsed = lastUsed;
    }
}
