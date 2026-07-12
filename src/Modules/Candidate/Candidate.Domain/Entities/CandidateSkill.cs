namespace Candidate.Domain.Entities;

/// <summary>
/// Join entity linking a <see cref="CandidateProfile"/> to a <see cref="Skill"/> (many-to-many).
/// Uses a composite primary key (CandidateProfileId, SkillId) following the repository convention
/// established for join tables (see JobPostingSkill).
/// </summary>
public class CandidateSkill
{
    public Guid CandidateProfileId { get; private set; }
    public Guid SkillId { get; private set; }

    /// <summary>Optional self-declared proficiency (e.g. Beginner, Intermediate, Expert).</summary>
    public string? ProficiencyLevel { get; private set; }

    public CandidateProfile? CandidateProfile { get; private set; }
    public Skill? Skill { get; private set; }

    // Required by EF Core.
    private CandidateSkill()
    {
    }

    public CandidateSkill(Guid candidateProfileId, Guid skillId, string? proficiencyLevel = null)
    {
        CandidateProfileId = candidateProfileId;
        SkillId = skillId;
        ProficiencyLevel = proficiencyLevel;
    }
}
