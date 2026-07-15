namespace Analytics.Domain.Entities;

public class TalentPoolProgressReport
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid TalentPoolEntryId { get; set; }
    public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;

    public string SkillsGainedJson { get; set; } = string.Empty;
    public string ResumeFreshnessStatus { get; set; } = string.Empty;

    public decimal CurrentMatchScore { get; set; }
    public string Recommendation { get; set; } = string.Empty;
}