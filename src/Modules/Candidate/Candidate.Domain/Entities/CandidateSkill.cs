namespace Candidate.Domain.Entities;

public class CandidateSkill
{
    public Guid CandidateProfileId { get; set; }
    public Guid SkillId { get; set; }
    public string ProficiencyLevel { get; set; } = string.Empty;
}
