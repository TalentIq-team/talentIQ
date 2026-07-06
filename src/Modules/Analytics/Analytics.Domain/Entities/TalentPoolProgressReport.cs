namespace Analytics.Domain.Entities;

public class TalentPoolProgressReport
{
    public Guid Id { get; set; }
    public Guid TalentPoolEntryId { get; set; }
    public DateTime GeneratedAt { get; set; }
    public string SkillsGainedJson { get; set; } = string.Empty;
    public string Recommendation { get; set; } = string.Empty;
}
